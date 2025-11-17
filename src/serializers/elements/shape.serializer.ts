import type { ShapeElementDTO } from "@/types/elements.types";
import type { Dimensions, Stroke } from "@/types/base.types";
import PptxGenJS from "pptxgenjs";
import { dimensionsToPercentage } from "@/utils/units";
import { positionToPercentage } from "@/utils/units";
import { pxToPoints } from "@/utils/units";
import { pxToInches } from "@/utils/units";

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

const getShapeType = (
  shape: ShapeElementDTO["shapeType"],
): PptxGenJS.ShapeType => {
  return shape as PptxGenJS.ShapeType;
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

export const serializeShape = (
  slide: PptxGenJS.Slide,
  element: ShapeElementDTO,
  viewport: Dimensions,
): void => {
  const pos = positionToPercentage(element.position, viewport);
  const dims = dimensionsToPercentage(element.dimensions, viewport);

  const shapeType: PptxGenJS.ShapeType =
    getShapeType(element.shapeType) || PptxGenJS.ShapeType.rect;

  const shapeOptions: PptxGenJS.ShapeProps = {
    x: pos.x,
    y: pos.y,
    w: dims.w,
    h: dims.h,
  };

  if (element.fill) {
    const fillProps: PptxGenJS.ShapeFillProps = {};

    if (element.fill.type === "solid") {
      fillProps.color = element.fill.color.toUpperCase();

      if (element.fill.opacity !== undefined && element.fill.opacity < 1) {
        const transparencyPercent = Math.round(
          (1 - element.fill.opacity) * 100,
        );
        fillProps.transparency = transparencyPercent;
      }
    } else if (element.fill.type === "gradient") {
      /*
       * BACKLOG: Gradient fills are not supported by pptxgenjs ShapeFillProps.
       * The pptxgenjs library only supports solid fills (type: 'solid' | 'none').
       * As a fallback, we use the first color stop of the gradient.
       */
      const firstStop = element.fill.stops[0];
      if (firstStop) {
        fillProps.color = firstStop.color.toUpperCase();
      }
    }

    if (fillProps.color) {
      shapeOptions.fill = fillProps;
    }
  }

  if (element.stroke) {
    const lineProps: PptxGenJS.ShapeLineProps = {
      color: element.stroke.color.toUpperCase(),
      width: element.stroke.width,
      dashType: getStrokeDashType(element.stroke),
    };

    if (element.stroke.opacity !== undefined) {
      lineProps.transparency = Math.round((1 - element.stroke.opacity) * 100);
    }

    shapeOptions.line = lineProps;
  }

  if (element.rotation) {
    shapeOptions.rotate = element.rotation;
  }

  if (element.borderRadius && element.shapeType === "roundRect") {
    const minDimension = Math.min(
      element.dimensions.width,
      element.dimensions.height,
    );
    const normalizedRadius = Math.min(element.borderRadius / minDimension, 1);
    shapeOptions.rectRadius = normalizedRadius;
  }

  if (element.shadow) {
    const offsetX = element.shadow.offset.x;
    const offsetY = element.shadow.offset.y;
    const offsetDistance = Math.sqrt(offsetX ** 2 + offsetY ** 2);

    const angleRadians = Math.atan2(offsetY, offsetX);
    const angleDegrees = (angleRadians * 180) / Math.PI;
    const normalizedAngle = ((angleDegrees % 360) + 360) % 360;

    shapeOptions.shadow = {
      type: element.shadow.type,
      color: element.shadow.color.toUpperCase(),
      blur: pxToPoints(element.shadow.blur),
      offset: pxToPoints(offsetDistance),
      angle: normalizedAngle,
      opacity: element.shadow.opacity ?? 1,
    };
  }

  slide.addShape(shapeType, shapeOptions);
};
