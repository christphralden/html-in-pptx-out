export type ElementType =
  | "text"
  | "image"
  | "shape"
  | "chart"
  | "table"
  | "line";

export interface Position {
  left: number;
  top: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Bounds extends Position, Dimensions {}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Typography {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: "normal" | "italic" | "oblique";
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
  underline?: boolean;
  strikethrough?: boolean;
  textAlign?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
}

export interface GradientStop {
  color: string;
  position: number;
}

export interface SolidFill {
  type: "solid";
  color: string;
  opacity?: number;
}

export interface GradientFill {
  type: "gradient";
  gradientType: "linear" | "radial";
  angle?: number;
  stops: GradientStop[];
}

export interface ImageFill {
  type: "image";
  src: string;
  fit?: "cover" | "contain" | "stretch" | "tile";
}

export type Fill = SolidFill | GradientFill | ImageFill;

export interface Stroke {
  color: string;
  width: number;
  style: "solid" | "dashed" | "dotted";
  opacity?: number;
}

export interface Border {
  top?: Stroke;
  right?: Stroke;
  bottom?: Stroke;
  left?: Stroke;
}

export interface Shadow {
  type: "outer" | "inner";
  color: string;
  blur: number;
  offset: { x: number; y: number };
  opacity?: number;
}

export interface Elements {
  type: ElementType;
  id: string;
  position: Position;
  dimensions: Dimensions;
  zIndex?: number;
  rotation?: number;
  opacity?: number;
}
