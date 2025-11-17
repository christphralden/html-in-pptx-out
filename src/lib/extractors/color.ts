import { sanitizeColor } from "@/utils/sanitize";

export const parseColorOpacity = (rgba: string): number | undefined => {
  const rgbaMatch = rgba.match(
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/,
  );

  if (rgbaMatch) {
    const opacity = parseFloat(rgbaMatch[1]);
    if (opacity < 1) {
      return opacity;
    }
  }

  return undefined;
};

export const parseHex = (hex: string): string | undefined => {
  return sanitizeColor(hex) || undefined;
};

export const transformBgColorToSolidFill = (
  bgColor: string,
): { color: string; opacity?: number } | undefined => {
  if (!bgColor || bgColor === "transparent" || bgColor === "rgba(0, 0, 0, 0)") {
    return undefined;
  }

  const hex = sanitizeColor(bgColor);
  if (!hex) return undefined;

  const opacity = parseColorOpacity(bgColor);

  return {
    color: hex,
    opacity: opacity,
  };
};
