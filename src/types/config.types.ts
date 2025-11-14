import type { Config } from './dto.types';

export interface HtmlToPptxConfig extends Config {
  parser?: HTMLParser;
  renderer?: PptxRenderer;
  enableScripts?: boolean;
  allowExternalResources?: boolean;
}

export interface HTMLParser {
  parse(html: string, config: Config): Promise<ParsedHTML>;
}

export interface ParsedHTML {
  slides: HTMLElement[];
  metadata?: Record<string, string>;
}

export interface HTMLElement {
  tag: string;
  attributes: Record<string, string>;
  children: HTMLElement[];
  textContent?: string;
}

export interface PptxRenderer {
  render(presentation: any): Promise<ArrayBuffer>;
}

export interface ExportOptions {
  format: 'pptx';
  filename: string;
  path?: string;
  compression?: boolean;
}

export interface ImageExportOptions {
  format: 'png' | 'webp' | 'jpg';
  quality?: number;
  outputDir: string;
  naming?: (slideIndex: number, slideId: string) => string;
  width?: number;
  height?: number;
}

export type HTMLSource = string | HTMLSourceOptions;

export interface HTMLSourceOptions {
  type: 'string' | 'file' | 'url';
  content: string;
}
