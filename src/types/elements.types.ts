import type {
  Elements,
  Position,
  Typography,
  Padding,
  Fill,
  Stroke,
  Border,
  Bounds,
  ElementType,
  Shadow,
} from "./base.types";
import type { ChartData, SourceLibrary } from "./chart.types";
export type { ChartData, ChartSeries, ChartOptions, SourceLibrary } from "./chart.types";

export interface TextRun {
  content: string;
  tagName?: string;
  className?: string;
  typography?: Typography;
  href?: string;
  children?: TextRun[];
}

export interface TextElementDTO extends Elements {
  type: Extract<ElementType, "text">;
  content: string;
  runs?: TextRun[];
  typography?: Typography;
  textType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "body";
  autoFit?: boolean;
  vertical?: boolean;
  padding?: Padding;
}

export interface ShapeElementDTO extends Elements {
  type: Extract<ElementType, "shape">;
  shapeType: "rect" | "ellipse" | "roundRect" | "triangle" | "custom";
  fill?: Fill;
  stroke?: Stroke;
  borderRadius?: number;
  shadow?: Shadow;
  path?: string;
  viewBox?: [number, number];
  fixedRatio?: boolean;
}

export interface ImageElementDTO extends Elements {
  type: Extract<ElementType, "image">;
  src: string;
  alt?: string;
  fixedRatio?: boolean;
  fit?: "cover" | "contain" | "stretch";
  clip?: Bounds;
}

export interface LineElementDTO extends Omit<Elements, "dimensions" | "position"> {
  type: Extract<ElementType, "line">;
  start: Position;
  end: Position;
  stroke: Stroke;
}

export interface TableCellDTO {
  id: string;
  text: string;
  colspan?: number;
  rowspan?: number;
  typography?: Typography;
  fill?: Fill;
  border?: Border;
}

export interface TableElementDTO extends Elements {
  type: Extract<ElementType, "table">;
  rows: TableCellDTO[][];
  colWidths?: number[];
  cellMinHeight?: number;
  headerRow?: boolean;
  headerColumn?: boolean;
}

export interface ChartElementDTO extends Elements {
  type: Extract<ElementType, "chart">;
  data: ChartData;
  sourceLibrary?: SourceLibrary;
  previewImage?: string;
}

export type ElementDTO =
  | TextElementDTO
  | ShapeElementDTO
  | ImageElementDTO
  | LineElementDTO
  | TableElementDTO
  | ChartElementDTO;
