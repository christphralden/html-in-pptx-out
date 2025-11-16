import { NAMED_COLORS } from "@/constants";

export const cssColorToHex = (color: string): string => {
  if (!color) return "000000";

  const trimmed = color.trim();

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return hex
        .split("")
        .map((c) => c + c)
        .join("")
        .toUpperCase();
    }
    return hex.toUpperCase().slice(0, 6);
  }

  const rgbMatch = trimmed.match(
    /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/,
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    return [r, g, b]
      .map((c) =>
        Math.min(255, Math.max(0, c))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase();
  }

  const lowerColor = trimmed.toLowerCase();
  if (NAMED_COLORS[lowerColor]) {
    return NAMED_COLORS[lowerColor];
  }

  return "000000";
};

export const cssColorToOpacity = (color: string): number | undefined => {
  const rgbaMatch = color.match(
    /^rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/,
  );
  if (rgbaMatch) {
    return parseFloat(rgbaMatch[1]);
  }
  return undefined;
};
