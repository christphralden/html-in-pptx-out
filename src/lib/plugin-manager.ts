import type {
  Plugin,
  PluginManagerInterface,
  PluginContext,
} from '@/types/plugin.types';
import type { SlideDTO, PresentationDTO } from '@/types/presentation.types';
import type { ParserConfig } from '@/types/config.types';
import type PptxGenJS from 'pptxgenjs';

export class PluginManager implements PluginManagerInterface {
  private plugins: Plugin[] = [];

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

  async executeBeforeParse(
    html: string,
    config: ParserConfig,
    context: PluginContext
  ): Promise<string> {
    let result = html;

    for (const plugin of this.plugins) {
      if (plugin.beforeParse) {
        result = await plugin.beforeParse(result, config, context);
      }
    }

    return result;
  }

  async executeOnSlide(
    slide: SlideDTO,
    context: PluginContext
  ): Promise<SlideDTO> {
    let result = slide;

    for (const plugin of this.plugins) {
      if (plugin.onSlide) {
        result = await plugin.onSlide(result, context);
      }
    }

    return result;
  }

  async executeAfterGenerate(
    pptx: PptxGenJS,
    presentation: PresentationDTO,
    context: PluginContext
  ): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.afterGenerate) {
        await plugin.afterGenerate(pptx, presentation, context);
      }
    }
  }
}
