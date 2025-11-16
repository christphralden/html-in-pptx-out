import type {
  ExportConfig,
  ImageExportConfig,
  HTMLSource,
  ConverterConfig,
  ParserStrategy,
  SerializerStrategy,
} from "@/types/config.types";
import type { PresentationDTO, SlideDTO } from "@/types/presentation.types";
import type { ElementDTO } from "@/types/elements.types";
import type { Plugin } from "@/types/plugin.types";
import { PluginManager } from "@/lib/plugin-manager";
import { assertNonNull } from "@/utils/assert";
import { DEFAULTS } from "@/constants";

export class BaseConverter {
  protected config: Required<Pick<ConverterConfig, "selector" | "dimensions">> &
    ConverterConfig;
  protected pluginManager: PluginManager;
  protected presentation: PresentationDTO | null = null;
  protected source: string | null = null;
  protected parser: ParserStrategy;
  protected serializer: SerializerStrategy;

  constructor(config: ConverterConfig) {
    assertNonNull(config.parser, "Parser strategy is required");
    assertNonNull(config.serializer, "Serializer strategy is required");

    this.config = {
      ...config,
      selector: config.selector || ".slide",
      dimensions: config.dimensions || {
        width: DEFAULTS.SLIDE_WIDTH,
        height: DEFAULTS.SLIDE_HEIGHT,
      },
    };
    this.parser = config.parser;
    this.serializer = config.serializer;
    this.pluginManager = new PluginManager();

    const corePlugins = config.plugins?.core ?? [];
    const extensionPlugins = config.plugins?.extensions ?? [];

    corePlugins.forEach((plugin) => this.use(plugin));
    extensionPlugins.forEach((plugin) => this.use(plugin));
  }

  use(plugin: Plugin): this {
    this.pluginManager.register(plugin);
    return this;
  }

  load(input: HTMLSource): this {
    if (typeof input === "string") {
      this.source = input;
    } else {
      this.source = input.content;
    }
    return this;
  }

  async convert(): Promise<this> {
    assertNonNull(this.source, "No HTML source loaded. Call load() first.");

    if (this.config.debug) {
      console.group("[html-in-pptx-out] convert");
    }
    const parserConfig = {
      selector: this.config.selector,
      dimensions: this.config.dimensions,
    };

    const html = await this.pluginManager.executeBeforeParse(
      this.source,
      parserConfig,
    );

    const { elements, cleanup } = await this.parser.parse(html, parserConfig);

    if (this.config.debug) {
      console.log("before: executeOnParse", {
        elements,
      });
    }

    const slidesMap = new Map<number, ElementDTO[]>();

    for (const { slideIndex, element, parseContext } of elements) {
      const dto = await this.pluginManager.executeOnParse(
        element,
        parseContext,
      );

      if (dto) {
        if (!slidesMap.has(slideIndex)) {
          slidesMap.set(slideIndex, []);
        }
        slidesMap.get(slideIndex)!.push(dto);
      }
    }

    if (this.config.debug) {
      console.log("after: executeOnParse", {
        slides: slidesMap,
      });
    }

    cleanup();

    const slides: SlideDTO[] = [];
    const slideIndices = Array.from(slidesMap.keys()).sort((a, b) => a - b);

    for (const slideIndex of slideIndices) {
      const slide: SlideDTO = {
        id: crypto.randomUUID(),
        order: slideIndex,
        elements: slidesMap.get(slideIndex) || [],
      };
      slides.push(slide);
    }

    this.presentation = {
      slides,
      metadata: {
        createdAt: new Date(),
      },
      viewport: this.config.dimensions,
    };

    for (let i = 0; i < this.presentation.slides.length; i++) {
      this.presentation.slides[i] = await this.pluginManager.executeOnSlide(
        this.presentation.slides[i],
      );
    }

    this.pluginManager.setPresentation(this.presentation);

    if (this.config.debug) {
      console.log("after: executeOnSlide", {
        presentation: this.presentation,
      });
      console.groupEnd();
    }

    return this;
  }

  async export(options: ExportConfig): Promise<ArrayBuffer> {
    assertNonNull(
      this.presentation,
      "No presentation to export. Call convert() first.",
    );

    const buffer = await this.serializer.serialize(this.presentation, options);
    return buffer;
  }

  async exportImages(_options: ImageExportConfig): Promise<void> {
    throw new Error("Not implemented");
  }

  getPresentation(): PresentationDTO {
    assertNonNull(
      this.presentation,
      "No presentation available. Call convert() first.",
    );
    return this.presentation;
  }
}
