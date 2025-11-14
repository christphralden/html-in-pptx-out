import type {
  Plugin,
  PluginManager as IPluginManager,
  PluginContext,
} from '@/types/plugin.types';
import type { SlideDTO, PresentationDTO, Config } from '@/types/dto.types';
import type PptxGenJS from 'pptxgenjs';

export class PluginManager implements IPluginManager {
  private plugins: Plugin[] = [];

  register(plugin: Plugin): void {
    if (this.plugins.some((p) => p.name === plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    this.plugins.push(plugin);
  }

  unregister(pluginName: string): void {
    const index = this.plugins.findIndex((p) => p.name === pluginName);
    if (index !== -1) {
      this.plugins.splice(index, 1);
    }
  }

  getPlugins(): Plugin[] {
    return [...this.plugins];
  }

  async executeBeforeParse(
    html: string,
    config: Config,
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
