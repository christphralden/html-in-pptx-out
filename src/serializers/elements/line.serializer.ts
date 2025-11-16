import type { LineElementDTO } from "@/types/elements.types";
import type { Dimensions, Stroke } from "@/types/base.types";
import type PptxGenJS from "pptxgenjs";

const STROKE_DASH_MAP: Record<
  string,
  | "solid"
  | "dash"
  | "dashDot"
  | "lgDash"
  | "lgDashDot"
  | "lgDashDotDot"
  | "sysDash"
  | "sysDot"
> = {
  solid: "solid",
  dashed: "dash",
  dotted: "sysDot",
};

const getStrokeDashType = (
  stroke: Stroke,
):
  | "solid"
  | "dash"
  | "dashDot"
  | "lgDash"
  | "lgDashDot"
  | "lgDashDotDot"
  | "sysDash"
  | "sysDot" => {
  return STROKE_DASH_MAP[stroke.style] || "solid";
};

export const serializeLine = (
  slide: PptxGenJS.Slide,
  element: LineElementDTO,
  viewport: Dimensions,
): void => {
  const startXPercent = (element.start.left / viewport.width) * 100;
  const startYPercent = (element.start.top / viewport.height) * 100;
  const endXPercent = (element.end.left / viewport.width) * 100;
  const endYPercent = (element.end.top / viewport.height) * 100;

  const width = Math.abs(endXPercent - startXPercent);
  const height = Math.abs(endYPercent - startYPercent);

  const lineProps: PptxGenJS.ShapeLineProps = {
    color: element.stroke.color.toUpperCase(),
    width: element.stroke.width,
    dashType: getStrokeDashType(element.stroke),
  };

  if (element.stroke.opacity !== undefined) {
    lineProps.transparency = Math.round((1 - element.stroke.opacity) * 100);
  }

  const lineOptions: PptxGenJS.ShapeProps = {
    x: `${Math.min(startXPercent, endXPercent)}%`,
    y: `${Math.min(startYPercent, endYPercent)}%`,
    w: `${width || 0.1}%`,
    h: `${height || 0.1}%`,
    line: lineProps,
  };

  const flipH = element.end.left < element.start.left;
  const flipV = element.end.top < element.start.top;

  if (flipH) {
    lineOptions.flipH = true;
  }

  if (flipV) {
    lineOptions.flipV = true;
  }

  slide.addShape("line", lineOptions);
};
