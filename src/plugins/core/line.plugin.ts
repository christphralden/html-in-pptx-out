import type { Plugin } from "@/types/plugin.types";
import type { LineElementDTO } from "@/types/elements.types";
import type { Position, Stroke } from "@/types/base.types";
import {
  extractRotation,
  extractOpacity,
  extractZIndex,
} from "@/lib/extractors/typography";
import { hasSingleBorderSide } from "@/lib/extractors/classifier";
import { sanitizeColor } from "@/utils/sanitize";

const extractLineStroke = (
  style: CSSStyleDeclaration,
  side: "left" | "right" | "top" | "bottom",
): Stroke => {
  let width = 1;
  let borderColor = "rgb(0,0,0)";
  let borderStyle = "solid";

  if (side === "left") {
    width = parseFloat(style.borderLeftWidth) || 1;
    borderColor = style.borderLeftColor || "rgb(0,0,0)";
    borderStyle = style.borderLeftStyle || "solid";
  } else if (side === "right") {
    width = parseFloat(style.borderRightWidth) || 1;
    borderColor = style.borderRightColor || "rgb(0,0,0)";
    borderStyle = style.borderRightStyle || "solid";
  } else if (side === "top") {
    width = parseFloat(style.borderTopWidth) || 1;
    borderColor = style.borderTopColor || "rgb(0,0,0)";
    borderStyle = style.borderTopStyle || "solid";
  } else {
    width = parseFloat(style.borderBottomWidth) || 1;
    borderColor = style.borderBottomColor || "rgb(0,0,0)";
    borderStyle = style.borderBottomStyle || "solid";
  }

  const hex = sanitizeColor(borderColor) || "000000";

  let strokeStyle: "solid" | "dashed" | "dotted" = "solid";
  if (borderStyle === "dashed") strokeStyle = "dashed";
  else if (borderStyle === "dotted") strokeStyle = "dotted";

  let opacity: number | undefined;
  const rgbaMatch = borderColor.match(
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/,
  );
  if (rgbaMatch) {
    const extractedOpacity = parseFloat(rgbaMatch[1]);
    if (extractedOpacity < 1) {
      opacity = extractedOpacity;
    }
  }

  return {
    color: hex,
    width: width,
    style: strokeStyle,
    opacity: opacity,
  };
};

const calculateLinePositions = (
  boundingRect: DOMRect,
  slideRect: DOMRect,
  side: "left" | "right" | "top" | "bottom",
): { start: Position; end: Position } => {
  const relLeft = boundingRect.left - slideRect.left;
  const relTop = boundingRect.top - slideRect.top;
  const relRight = relLeft + boundingRect.width;
  const relBottom = relTop + boundingRect.height;

  if (side === "left") {
    return {
      start: { left: relLeft, top: relTop },
      end: { left: relLeft, top: relBottom },
    };
  }

  if (side === "right") {
    return {
      start: { left: relRight, top: relTop },
      end: { left: relRight, top: relBottom },
    };
  }

  if (side === "top") {
    return {
      start: { left: relLeft, top: relTop },
      end: { left: relRight, top: relTop },
    };
  }

  return {
    start: { left: relLeft, top: relBottom },
    end: { left: relRight, top: relBottom },
  };
};

export const linePlugin: Plugin<LineElementDTO> = {
  name: "core:line",
  handles: ["line"],
  onParse: (element, parseContext) => {
    const { computedStyle, boundingRect, tagName, slideElement } = parseContext;

    const slideRect = slideElement.getBoundingClientRect();

    let stroke: Stroke;
    let start: Position;
    let end: Position;

    if (tagName === "hr") {
      const relLeft = boundingRect.left - slideRect.left;
      const relTop = boundingRect.top - slideRect.top;
      const relRight = relLeft + boundingRect.width;

      start = { left: relLeft, top: relTop };
      end = { left: relRight, top: relTop };

      const borderWidth = parseFloat(computedStyle.borderTopWidth) || 1;
      const borderColor = computedStyle.borderTopColor || "rgb(0,0,0)";
      const hex = sanitizeColor(borderColor) || "000000";

      stroke = {
        color: hex,
        width: borderWidth,
        style: "solid",
      };
    } else {
      const side = hasSingleBorderSide(computedStyle);
      if (!side) return null;

      const positions = calculateLinePositions(boundingRect, slideRect, side);
      start = positions.start;
      end = positions.end;
      stroke = extractLineStroke(computedStyle, side);
    }

    const lineElement: LineElementDTO = {
      type: "line",
      id: crypto.randomUUID(),
      start: start,
      end: end,
      stroke: stroke,
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return lineElement;
  },
};
