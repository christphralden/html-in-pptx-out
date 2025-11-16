import { Dimensions } from "./base.types";
import type { PresentationDTO } from "./presentation.types";
import type { Plugin, PluginContext, ParseContext, PluginManagerInterface } from "./plugin.types";

export interface PluginsConfig {
  core?: Plugin[];
  extensions?: Plugin[];
}

export interface ParserConfig {
  selector: string;
  dimensions: Dimensions;
  plugins?: PluginsConfig;
}

export interface ExportConfig {
  format: "pptx";
  filename: string;
  path?: string;
  compression?: boolean;
}

export interface ImageExportConfig {
  format: "png" | "webp" | "jpg";
  quality?: number;
  output: {
    directory: string;
    naming?: (index: number, id: string) => string;
  };
  dimensions?: {
    width: number;
    height: number;
  };
}

export type HTMLSource = string | HTMLSourceConfig;

export interface HTMLSourceConfig {
  type: "string" | "file" | "url";
  content: string;
}

export interface ParserElement {
  slideIndex: number;
  element: HTMLElement;
  parseContext: ParseContext;
}

export interface ParserResult {
  elements: ParserElement[];
  cleanup: () => void;
}

export interface ParserStrategy {
  parse(html: string, config: ParserConfig): Promise<ParserResult>;
}

export interface SerializerStrategy {
  setPluginManager?(pluginManager: PluginManagerInterface): void;
  serialize(
    presentation: PresentationDTO,
    options: ExportConfig,
  ): Promise<ArrayBuffer>;
}

export interface ConverterConfig {
  selector?: string;
  dimensions?: Dimensions;
  plugins?: PluginsConfig;
  parser?: ParserStrategy;
  serializer?: SerializerStrategy;
  debug?: boolean;
}
