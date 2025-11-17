import type { Stroke } from "@/types/base.types";
import { sanitizeColor } from "@/utils/sanitize";
import { parseColorOpacity } from "./color";

export const extractStrokeFromBorder = (
  color: string,
  width: number,
  borderStyle: string,
): Stroke | undefined => {
  if (width === 0) return undefined;

  const hex = sanitizeColor(color);
  if (!hex) return undefined;

  let strokeStyle: "solid" | "dashed" | "dotted" = "solid";
  if (borderStyle === "dashed") strokeStyle = "dashed";
  else if (borderStyle === "dotted") strokeStyle = "dotted";

  const opacity = parseColorOpacity(color);

  return {
    color: hex,
    width: width,
    style: strokeStyle,
    opacity: opacity,
  };
};
