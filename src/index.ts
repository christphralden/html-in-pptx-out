export { HtmlToPptx } from './core/converter';
export { PluginManager } from './lib/plugin-manager';
export { DefaultHTMLParser } from './core/parser';
export { PptxSerializer } from './core/serializer';

export type {
  PresentationDTO,
  SlideDTO,
  ElementDTO,
  TextElement,
  ImageElement,
  ChartElement,
  ShapeElement,
  Position,
  Dimensions,
  TextStyles,
  ShapeStyles,
  Background,
  ChartData,
  ChartDataset,
  ChartType,
  ShapeType,
  ChartOptions,
  Metadata,
  Config,
} from './types/dto.types';

export type {
  Plugin,
  BeforeParseFn,
  OnSlideFn,
  AfterGenerateFn,
  PluginContext,
  PluginManager as IPluginManager,
} from './types/plugin.types';

export type {
  HtmlToPptxConfig,
  HTMLParser,
  ParsedHTML,
  HTMLElement,
  PptxRenderer,
  ExportOptions,
  ImageExportOptions,
  HTMLSource,
  HTMLSourceOptions,
} from './types/config.types';
