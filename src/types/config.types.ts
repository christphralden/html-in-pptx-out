import { Dimensions } from "./base.types";
import type { PresentationDTO } from "./presentation.types";
import type { Plugin, PluginContext } from "./plugin.types";

export interface ParserConfig {
  selector: string;
  dimensions: Dimensions;
}

export interface PluginConfig {
  name: string;
  enabled?: boolean;
  options?: Record<string, unknown>;
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

export interface ParserStrategy {
  parse(html: string, config: ParserConfig): Promise<PresentationDTO>;
}

export interface SerializerStrategy {
  serialize(presentation: PresentationDTO): Promise<ArrayBuffer>;
}
