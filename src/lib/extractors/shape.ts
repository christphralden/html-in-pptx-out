import type {
  Fill,
  Stroke,
  Shadow,
  SolidFill,
  GradientFill,
  GradientStop,
} from "@/types/base.types";
import { sanitizeColor } from "@/utils/sanitize";
import { parseColorOpacity } from "@/lib/extractors/color";

const parseGradientStops = (rgba: string): GradientStop[] => {
  const stops: GradientStop[] = [];
  const colorStopRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,6}|\w+)\s*([\d.]+%)?/g;
  let match;
  let index = 0;

  while ((match = colorStopRegex.exec(rgba)) !== null) {
    const [, colorPart, positionPart] = match;
    const hex = sanitizeColor(colorPart);
    if (!hex) continue;

    let position = 0;
    if (positionPart) {
      position = parseFloat(positionPart) / 100;
    } else {
      position = index === 0 ? 0 : 1;
    }

    const opacity = parseColorOpacity(colorPart);
    stops.push({ color: hex, position, opacity });
    index++;
  }

  return stops;
};

const parseGradientAngle = (gradient: string): number => {
  const degMatch = gradient.match(/(\d+)deg/);
  if (degMatch) {
    return parseInt(degMatch[1], 10);
  }

  const directionMap: Record<string, number> = {
    "to top": 0,
    "to right": 90,
    "to bottom": 180,
    "to left": 270,
    "to top right": 45,
    "to bottom right": 135,
    "to bottom left": 225,
    "to top left": 315,
  };

  for (const [direction, angle] of Object.entries(directionMap)) {
    if (gradient.includes(direction)) {
      return angle;
    }
  }

  return 180;
};

export const extractFill = (style: CSSStyleDeclaration): Fill | undefined => {
  const bgImage = style.backgroundImage;

  if (bgImage && bgImage !== "none") {
    if (bgImage.includes("linear-gradient")) {
      const stops = parseGradientStops(bgImage);
      if (stops.length >= 2) {
        const gradient: GradientFill = {
          type: "gradient",
          gradientType: "linear",
          angle: parseGradientAngle(bgImage),
          stops,
        };
        return gradient;
      }
    }

    if (bgImage.includes("radial-gradient")) {
      const stops = parseGradientStops(bgImage);
      if (stops.length >= 2) {
        const gradient: GradientFill = {
          type: "gradient",
          gradientType: "radial",
          stops,
        };
        return gradient;
      }
    }
  }

  const bgColor = style.backgroundColor;
  if (!bgColor || bgColor === "transparent" || bgColor === "rgba(0, 0, 0, 0)") {
    return undefined;
  }

  const hex = sanitizeColor(bgColor);
  if (!hex) return undefined;

  const opacity = parseColorOpacity(bgColor);

  const fill: SolidFill = {
    type: "solid",
    color: hex,
    opacity: opacity,
  };

  return fill;
};

export const extractStroke = (
  style: CSSStyleDeclaration,
): Stroke | undefined => {
  const topWidth = parseFloat(style.borderTopWidth) || 0;
  const rightWidth = parseFloat(style.borderRightWidth) || 0;
  const bottomWidth = parseFloat(style.borderBottomWidth) || 0;
  const leftWidth = parseFloat(style.borderLeftWidth) || 0;

  if (topWidth === 0 && rightWidth === 0 && bottomWidth === 0 && leftWidth === 0) {
    return undefined;
  }

  const allWidthsPresent =
    topWidth > 0 && rightWidth > 0 && bottomWidth > 0 && leftWidth > 0;
  const allWidthsEqual =
    topWidth === rightWidth &&
    rightWidth === bottomWidth &&
    bottomWidth === leftWidth;

  if (!allWidthsPresent || !allWidthsEqual) {
    return undefined;
  }

  const allColorsEqual =
    style.borderTopColor === style.borderRightColor &&
    style.borderRightColor === style.borderBottomColor &&
    style.borderBottomColor === style.borderLeftColor;

  const allStylesEqual =
    style.borderTopStyle === style.borderRightStyle &&
    style.borderRightStyle === style.borderBottomStyle &&
    style.borderBottomStyle === style.borderLeftStyle;

  if (!allColorsEqual || !allStylesEqual) {
    return undefined;
  }

  const hex = sanitizeColor(style.borderTopColor);
  if (!hex) return undefined;

  let strokeStyle: "solid" | "dashed" | "dotted" = "solid";
  if (style.borderTopStyle === "dashed") strokeStyle = "dashed";
  else if (style.borderTopStyle === "dotted") strokeStyle = "dotted";

  const opacity = parseColorOpacity(style.borderTopColor);

  return {
    color: hex,
    width: topWidth,
    style: strokeStyle,
    opacity: opacity,
  };
};

export const extractBorderRadius = (
  style: CSSStyleDeclaration,
): number | undefined => {
  const radius = parseFloat(style.borderRadius) || 0;
  if (radius === 0) return undefined;
  return radius;
};

export const extractShadow = (
  style: CSSStyleDeclaration,
): Shadow | undefined => {
  const boxShadow = style.boxShadow;
  if (!boxShadow || boxShadow === "none") return undefined;

  const insetMatch = boxShadow.includes("inset");
  const shadowType: "outer" | "inner" = insetMatch ? "inner" : "outer";

  const cleanShadow = boxShadow.replace("inset", "").trim();

  const rgbaMatch = cleanShadow.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  let color = "000000";
  let opacity = 1;

  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    color = [r, g, b]
      .map((v) => parseInt(v, 10).toString(16).padStart(2, "0"))
      .join("");
    if (a) opacity = parseFloat(a);
  }

  const valuesMatch = cleanShadow.match(
    /(?:rgba?\([^)]+\)|#[0-9a-fA-F]+|\w+)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/,
  );

  if (!valuesMatch) return undefined;

  const [, offsetX, offsetY, blur] = valuesMatch;

  return {
    type: shadowType,
    color,
    blur: parseFloat(blur),
    offset: {
      x: parseFloat(offsetX),
      y: parseFloat(offsetY),
    },
    opacity: opacity < 1 ? opacity : undefined,
  };
};
