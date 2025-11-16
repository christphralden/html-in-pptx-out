import DOMPurify from "dompurify";
import { FONT_LIST } from "src/fontlists.generated";

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

export const sanitizeFontFamily = (fontFamily: string): string => {
  const fonts = fontFamily.split(",").map((font) => {
    const f = font
      .trim()
      .replace(/^["']|["']$/g, "")
      .trim();

    if (!FONT_LIST.has(f.toLowerCase())) {
      return null;
    }
    return f;
  });
  return fonts.filter((font) => font != null).join(", ");
};

export const sanitizeColor = (color: string): string => {
  if (!color || color === "transparent") return "";

  const cleaned = color.trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    return (
      cleaned[0] +
      cleaned[0] +
      cleaned[1] +
      cleaned[1] +
      cleaned[2] +
      cleaned[2]
    );
  }

  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return cleaned;
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return [r, g, b]
      .map((v) => parseInt(v, 10).toString(16).padStart(2, "0"))
      .join("");
  }

  return "";
};

export const sanitizeString = (value: string): string => {
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
};
