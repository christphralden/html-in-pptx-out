import type { SlideDTO, PresentationDTO } from './presentation.types';
import type { ParserConfig } from './config.types';
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
  config: ParserConfig,
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

export interface PluginManagerInterface {
  register(plugin: Plugin): void;
  unregister(name: string): void;
  getPlugins(): Plugin[];
  executeBeforeParse(
    html: string,
    config: ParserConfig,
    context: PluginContext
  ): Promise<string>;
  executeOnSlide(slide: SlideDTO, context: PluginContext): Promise<SlideDTO>;
  executeAfterGenerate(
    pptx: PptxGenJS,
    presentation: PresentationDTO,
    context: PluginContext
  ): Promise<void>;
}
