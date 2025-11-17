import type { Typography, Padding } from "@/types/base.types";
import { sanitizeFontFamily, sanitizeColor } from "@/utils/sanitize";
import { DEFAULTS } from "@/constants";

export const parseFontWeight = (value: string): string | undefined => {
  const num = parseInt(value, 10);
  if (!isNaN(num)) return String(num);
  if (value === "bold") return "700";
  if (value === "bolder") return "700";
  if (value === "lighter") return "300";
  if (value === "normal") return "400";
  return undefined;
};

export const parseFontStyle = (
  value: string,
): Typography["fontStyle"] | undefined => {
  if (value === "italic") return "italic";
  if (value === "oblique") return "oblique";
  if (value === "normal") return "normal";
  return undefined;
};

export const parseTextAlign = (
  value: string,
): Typography["textAlign"] | undefined => {
  if (value === "left" || value === "start") return "left";
  if (value === "center") return "center";
  if (value === "right" || value === "end") return "right";
  if (value === "justify") return "justify";
  return undefined;
};

export const parseVerticalAlign = (
  value: string,
): Typography["verticalAlign"] | undefined => {
  if (value === "top") return "top";
  if (value === "middle") return "middle";
  if (value === "bottom") return "bottom";
  return undefined;
};

export const extractTypography = (style: CSSStyleDeclaration): Typography => {
  const typography: Typography = {
    fontFamily: sanitizeFontFamily(style.fontFamily) || DEFAULTS.FONT_FAMILY,
    fontSize: parseFloat(style.fontSize) || undefined,
    fontWeight: parseFontWeight(style.fontWeight),
    fontStyle: parseFontStyle(style.fontStyle),
    letterSpacing: parseFloat(style.letterSpacing) || undefined,
    lineHeight: parseFloat(style.lineHeight) || undefined,
    color: sanitizeColor(style.color) || undefined,
    underline: style.textDecorationLine?.includes("underline") || false,
    strikethrough: style.textDecorationLine?.includes("line-through") || false,
    textAlign: parseTextAlign(style.textAlign),
    verticalAlign: parseVerticalAlign(style.verticalAlign),
  };

  return typography;
};

export const extractPadding = (style: CSSStyleDeclaration): Padding => ({
  top: parseFloat(style.paddingTop) || 0,
  right: parseFloat(style.paddingRight) || 0,
  bottom: parseFloat(style.paddingBottom) || 0,
  left: parseFloat(style.paddingLeft) || 0,
});

export const extractRotation = (
  style: CSSStyleDeclaration,
): number | undefined => {
  const transform = style.transform;
  if (!transform || transform === "none") return undefined;

  const rotateMatch = transform.match(/rotate\(([-\d.]+)/);
  if (rotateMatch) {
    const deg = parseFloat(rotateMatch[1]);
    return deg || undefined;
  }

  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(",").map((v) => parseFloat(v.trim()));
    if (values.length >= 2) {
      const a = values[0];
      const b = values[1];
      const radians = Math.atan2(b, a);
      const degrees = radians * (180 / Math.PI);
      return Math.abs(degrees) < 0.01 ? undefined : degrees;
    }
  }

  return undefined;
};

export const extractOpacity = (
  style: CSSStyleDeclaration,
): number | undefined => {
  const opacity = parseFloat(style.opacity);
  return opacity === 1 ? undefined : opacity || undefined;
};

export const extractZIndex = (
  style: CSSStyleDeclaration,
): number | undefined => {
  return parseInt(style.zIndex, 10) || undefined;
};
