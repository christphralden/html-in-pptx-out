export interface PresentationDTO {
  slides: SlideDTO[];
  config: Config;
  metadata: Metadata;
}

export interface SlideDTO {
  id: string;
  order: number;
  elements: ElementDTO[];
  background?: Background;
}

export type ElementDTO = TextElement | ImageElement | ChartElement | ShapeElement;

export interface BaseElement {
  id: string;
  position: Position;
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  styles: TextStyles;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  dimensions: Dimensions;
  alt?: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  data: ChartData;
  chartType: ChartType;
  options?: ChartOptions;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  dimensions: Dimensions;
  styles: ShapeStyles;
}

export interface Position {
  x: number;
  y: number;
  unit?: 'px' | 'in' | '%';
}

export interface Dimensions {
  width: number;
  height: number;
  unit?: 'px' | 'in' | '%';
}

export interface TextStyles {
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
}

export interface ShapeStyles {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface Background {
  type: 'color' | 'gradient' | 'image';
  value: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
export type ShapeType = 'rect' | 'ellipse' | 'triangle' | 'line';

export interface ChartOptions {
  title?: string;
  showLegend?: boolean;
  showValues?: boolean;
}

export interface Metadata {
  title?: string;
  author?: string;
  subject?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface Config {
  slideSelector: string;
  titleSelector?: string;
  contentSelector?: string;
  defaultSlideWidth?: number;
  defaultSlideHeight?: number;
  unit?: 'px' | 'in';
}
