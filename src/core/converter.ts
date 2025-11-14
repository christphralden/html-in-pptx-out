import type {
  HtmlToPptxConfig,
  ExportOptions,
  ImageExportOptions,
  HTMLSource,
} from '@/types/config.types';
import type { PresentationDTO, SlideDTO } from '@/types/dto.types';
import type { Plugin, PluginContext } from '@/types/plugin.types';
import { PluginManager } from '@/lib/plugin-manager';
import { DefaultHTMLParser } from './parser';
import { PptxSerializer } from './serializer';

export class HtmlToPptx {
  private config: HtmlToPptxConfig;
  private pluginManager: PluginManager;
  private dto: PresentationDTO | null = null;
  private htmlSource: string | null = null;

  constructor(config: HtmlToPptxConfig) {
    this.config = {
      ...config,
      slideSelector: config.slideSelector || '.slide',
      parser: config.parser || new DefaultHTMLParser(),
    };
    this.pluginManager = new PluginManager();
  }

  load(input: HTMLSource): this {
    if (typeof input === 'string') {
      this.htmlSource = input;
    } else {
      this.htmlSource = input.content;
    }
    return this;
  }

  use(plugin: Plugin): this {
    this.pluginManager.register(plugin);
    return this;
  }

  async convert(): Promise<this> {
    if (!this.htmlSource) {
      throw new Error('No HTML source loaded. Call load() first.');
    }

    const context: PluginContext = {
      metadata: {},
      state: new Map(),
    };

    let html = await this.pluginManager.executeBeforeParse(
      this.htmlSource,
      this.config,
      context
    );

    const parser = this.config.parser || new DefaultHTMLParser();
    const parsed = await parser.parse(html, this.config);

    const slides: SlideDTO[] = [];
    for (let i = 0; i < parsed.slides.length; i++) {
      const slideDto: SlideDTO = {
        id: `slide-${i}`,
        order: i,
        elements: [],
      };

      const processedSlide = await this.pluginManager.executeOnSlide(
        slideDto,
        context
      );
      slides.push(processedSlide);
    }

    this.dto = {
      slides,
      config: this.config,
      metadata: {
        ...parsed.metadata,
        createdAt: new Date(),
      },
    };

    context.presentation = this.dto;

    return this;
  }

  async export(options: ExportOptions): Promise<void> {
    if (!this.dto) {
      throw new Error('No presentation to export. Call convert() first.');
    }

    const serializer = new PptxSerializer();
    const pptx = await serializer.serialize(this.dto);

    const context: PluginContext = {
      presentation: this.dto,
      metadata: {},
      state: new Map(),
    };

    await this.pluginManager.executeAfterGenerate(pptx, this.dto, context);

    await serializer.save(pptx, options);
  }

  async exportImages(options: ImageExportOptions): Promise<void> {
    if (!this.dto) {
      throw new Error('No presentation to export. Call convert() first.');
    }

    throw new Error('Image export not yet implemented');
  }

  getDTO(): PresentationDTO {
    if (!this.dto) {
      throw new Error('No presentation available. Call convert() first.');
    }
    return this.dto;
  }
}
