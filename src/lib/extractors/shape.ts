import type {
  Fill,
  Stroke,
  Shadow,
  SolidFill,
  GradientFill,
  GradientStop,
} from "@/types/base.types";
import { sanitizeColor } from "@/utils/sanitize";

const parseGradientStops = (gradientString: string): GradientStop[] => {
  const stops: GradientStop[] = [];
  const colorStopRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,6}|\w+)\s*([\d.]+%)?/g;
  let match;
  let index = 0;

  while ((match = colorStopRegex.exec(gradientString)) !== null) {
    const [, colorPart, positionPart] = match;
    const hex = sanitizeColor(colorPart);
    if (!hex) continue;

    let position = 0;
    if (positionPart) {
      position = parseFloat(positionPart) / 100;
    } else {
      position = index === 0 ? 0 : 1;
    }

    stops.push({ color: hex, position });
    index++;
  }

  return stops;
};

const parseGradientAngle = (gradientString: string): number => {
  const degMatch = gradientString.match(/(\d+)deg/);
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
    if (gradientString.includes(direction)) {
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

  const opacityMatch = bgColor.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
  const opacity = opacityMatch ? parseFloat(opacityMatch[1]) : 1;

  const fill: SolidFill = {
    type: "solid",
    color: hex,
    opacity: opacity < 1 ? opacity : undefined,
  };

  return fill;
};

export const extractStroke = (
  style: CSSStyleDeclaration,
): Stroke | undefined => {
  const borderWidth = parseFloat(style.borderWidth) || 0;
  if (borderWidth === 0) return undefined;

  const borderColor = style.borderColor;
  const hex = sanitizeColor(borderColor);
  if (!hex) return undefined;

  const borderStyle = style.borderStyle;
  let strokeStyle: "solid" | "dashed" | "dotted" = "solid";
  if (borderStyle === "dashed") strokeStyle = "dashed";
  else if (borderStyle === "dotted") strokeStyle = "dotted";

  let opacity: number | undefined;
  const opacityMatch = borderColor.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
  if (opacityMatch) {
    const extractedOpacity = parseFloat(opacityMatch[1]);
    if (extractedOpacity < 1) {
      opacity = extractedOpacity;
    }
  }

  return {
    color: hex,
    width: borderWidth,
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
