import type {
  Plugin,
  PluginManagerInterface,
  PluginContext,
  ParseContext,
} from '@/types/plugin.types';
import type { SlideDTO, PresentationDTO } from '@/types/presentation.types';
import type { ParserConfig } from '@/types/config.types';
import type { ElementDTO } from '@/types/elements.types';
import type PptxGenJS from 'pptxgenjs';

export class PluginManager implements PluginManagerInterface {
  private plugins: Plugin[] = [];
  private context: PluginContext = {
    metadata: {},
    state: new Map(),
  };

  register(plugin: Plugin): void {
    if (this.plugins.some((p) => p.name === plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    this.plugins.push(plugin);
  }

  unregister(name: string): void {
    const index = this.plugins.findIndex((p) => p.name === name);
    if (index !== -1) {
      this.plugins.splice(index, 1);
    }
  }

  getPlugins(): Plugin[] {
    return [...this.plugins];
  }

  setPresentation(presentation: PresentationDTO): void {
    this.context.presentation = presentation;
  }

  async executeBeforeParse(html: string, config: ParserConfig): Promise<string> {
    let result = html;

    for (const plugin of this.plugins) {
      if (plugin.beforeParse) {
        result = await plugin.beforeParse(result, config, this.context);
      }
    }

    return result;
  }

  async executeOnParse(
    element: HTMLElement,
    parseContext: ParseContext,
  ): Promise<ElementDTO | null> {
    for (const plugin of this.plugins) {
      if (!plugin.handles || !plugin.onParse) continue;

      const handlers = new Set(plugin.handles);
      if (!handlers.has(parseContext.elementType)) continue;

      const result = await plugin.onParse(element, parseContext, this.context);
      if (result) return result;
    }

    return null;
  }

  async executeOnSlide(slide: SlideDTO): Promise<SlideDTO> {
    let result = slide;

    for (const plugin of this.plugins) {
      if (plugin.onSlide) {
        result = await plugin.onSlide(result, this.context);
      }
    }

    return result;
  }

  async executeAfterGenerate(
    pptx: PptxGenJS,
    presentation: PresentationDTO,
  ): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.afterGenerate) {
        await plugin.afterGenerate(pptx, presentation, this.context);
      }
    }
  }
}
