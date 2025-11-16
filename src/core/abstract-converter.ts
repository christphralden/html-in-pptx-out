import type {
  ParserConfig,
  ExportConfig,
  ImageExportConfig,
  HTMLSource,
} from "@/types/config.types";
import type { PresentationDTO } from "@/types/presentation.types";
import type { Plugin, PluginContext } from "@/types/plugin.types";
import { PluginManager } from "@/lib/plugin-manager";
import { assertNonNull } from "@/utils/assert";

export abstract class AbstractConverter {
  protected config: ParserConfig;
  protected pluginManager: PluginManager;
  protected presentation: PresentationDTO | null = null;
  protected source: string | null = null;
  protected context: PluginContext;

  constructor(config: Partial<ParserConfig> = {}) {
    this.config = {
      selector: config.selector || ".slide",
      dimensions: config.dimensions || { width: 960, height: 540 },
    };
    this.pluginManager = new PluginManager();
    this.context = {
      metadata: {},
      state: new Map(),
    };
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

    const html = await this.pluginManager.executeBeforeParse(
      this.source,
      this.config,
      this.context,
    );

    this.source = html;
    this.presentation = await this.parse(this.source);
    this.context.presentation = this.presentation;

    for (let i = 0; i < this.presentation.slides.length; i++) {
      this.presentation.slides[i] = await this.pluginManager.executeOnSlide(
        this.presentation.slides[i],
        this.context,
      );
    }

    return this;
  }

  async export(options: ExportConfig): Promise<ArrayBuffer> {
    assertNonNull(
      this.presentation,
      "No presentation to export. Call convert() first.",
    );

    const buffer = await this.serialize(this.presentation, options);
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

  protected abstract parse(html: string): Promise<PresentationDTO>;
  protected abstract serialize(
    presentation: PresentationDTO,
    options: ExportConfig,
  ): Promise<ArrayBuffer>;
}
