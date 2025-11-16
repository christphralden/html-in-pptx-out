export { HtmlToPptx } from "@/core/converter";
export { BaseConverter } from "@/core/base-converter";

export type {
  ParserConfig,
  PluginsConfig,
  ExportConfig,
  ImageExportConfig,
  HTMLSource,
  HTMLSourceConfig,
  ConverterConfig,
  ParserStrategy,
  SerializerStrategy,
  ParserElement,
  ParserResult,
} from "@/types/config.types";

export type {
  PresentationDTO,
  SlideDTO,
  PresentationMetadata,
  SlideBackground,
} from "@/types/presentation.types";

export type {
  ElementDTO,
  TextElementDTO,
  ShapeElementDTO,
  ImageElementDTO,
  ChartElementDTO,
  TableElementDTO,
  LineElementDTO,
  ChartData,
  ChartSeries,
  ChartOptions,
  TableCellDTO,
} from "@/types/elements.types";

export type {
  ElementType,
  Position,
  Dimensions,
  Bounds,
  Padding,
  Typography,
  Fill,
  SolidFill,
  GradientFill,
  ImageFill,
  Stroke,
  Border,
  GradientStop,
} from "@/types/base.types";

export type {
  Plugin,
  PluginContext,
  ParseContext,
  BeforeParseFn,
  OnParseFn,
  OnSlideFn,
  AfterGenerateFn,
} from "@/types/plugin.types";

export { DEFAULTS, DEFAULT_CORE_PLUGINS } from "@/constants";

export * from "@/plugins/core";

export { IframeParser } from "@/parsers/iframe";
export { PptxSerializer } from "@/serializers/pptxgenjs";
