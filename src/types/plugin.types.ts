import type { SlideDTO, PresentationDTO, Config } from './dto.types';
import type PptxGenJS from 'pptxgenjs';

export interface Plugin {
  name: string;
  version?: string;
  beforeParse?: BeforeParseFn;
  onSlide?: OnSlideFn;
  afterGenerate?: AfterGenerateFn;
}

export type BeforeParseFn = (
  html: string,
  config: Config,
  context: PluginContext
) => Promise<string> | string;

export type OnSlideFn = (
  slide: SlideDTO,
  context: PluginContext
) => Promise<SlideDTO> | SlideDTO;

export type AfterGenerateFn = (
  pptx: PptxGenJS,
  presentation: PresentationDTO,
  context: PluginContext
) => Promise<void> | void;

export interface PluginContext {
  presentation?: PresentationDTO;
  metadata: Record<string, unknown>;
  state: Map<string, unknown>;
}

export interface PluginManager {
  register(plugin: Plugin): void;
  unregister(pluginName: string): void;
  getPlugins(): Plugin[];
  executeBeforeParse(html: string, config: Config, context: PluginContext): Promise<string>;
  executeOnSlide(slide: SlideDTO, context: PluginContext): Promise<SlideDTO>;
  executeAfterGenerate(pptx: PptxGenJS, presentation: PresentationDTO, context: PluginContext): Promise<void>;
}
