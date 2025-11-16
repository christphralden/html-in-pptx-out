import type { SlideDTO, PresentationDTO } from "./presentation.types";
import type { ParserConfig } from "./config.types";
import type { ElementDTO } from "./elements.types";
import { ElementType } from "./base.types";
import type PptxGenJS from "pptxgenjs";

export interface ParseContext {
  elementType: ElementType;
  tagName: string;
  computedStyle: CSSStyleDeclaration;
  boundingRect: DOMRect;
  slideIndex: number;
  slideElement: HTMLElement;
}

export interface Plugin {
  name: string;
  version?: string;
  handles?: ElementType[];
  beforeParse?: BeforeParseFn;
  onParse?: OnParseFn;
  onSlide?: OnSlideFn;
  afterGenerate?: AfterGenerateFn;
}

export type BeforeParseFn = (
  html: string,
  config: ParserConfig,
  context: PluginContext,
) => Promise<string> | string;

export type OnParseFn = (
  element: HTMLElement,
  parseContext: ParseContext,
  pluginContext: PluginContext,
) => Promise<ElementDTO | null> | ElementDTO | null;

export type OnSlideFn = (
  slide: SlideDTO,
  context: PluginContext,
) => Promise<SlideDTO> | SlideDTO;

export type AfterGenerateFn = (
  pptx: PptxGenJS,
  presentation: PresentationDTO,
  context: PluginContext,
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
  setPresentation(presentation: PresentationDTO): void;
  executeBeforeParse(html: string, config: ParserConfig): Promise<string>;
  executeOnParse(
    element: HTMLElement,
    parseContext: ParseContext,
  ): Promise<ElementDTO | null>;
  executeOnSlide(slide: SlideDTO): Promise<SlideDTO>;
  executeAfterGenerate(
    pptx: PptxGenJS,
    presentation: PresentationDTO,
  ): Promise<void>;
}
