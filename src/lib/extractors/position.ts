import type { Position, Dimensions } from "@/types/base.types";

export const extractRelativePosition = (
  elementRect: DOMRect,
  containerRect: DOMRect,
): Position => ({
  left: elementRect.left - containerRect.left,
  top: elementRect.top - containerRect.top,
});

export const extractDimensions = (
  rect: DOMRect,
  buffer: number = 1,
): Dimensions => ({
  width: rect.width * buffer,
  height: rect.height,
});
