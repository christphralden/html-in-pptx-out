import { COORDINATE_BUFFER } from "@/constants";
import type { Position, Dimensions } from "@/types/base.types";

export const extractRelativePosition = (
  elementRect: DOMRect,
  containerRect: DOMRect,
): Position => ({
  left: elementRect.left - containerRect.left,
  top: elementRect.top - containerRect.top,
});

export const extractDimensions = (rect: DOMRect): Dimensions => ({
  width: rect.width * COORDINATE_BUFFER,
  height: rect.height,
});
