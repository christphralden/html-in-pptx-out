import type { ElementType } from "@/types/base.types";

const TEXT_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "div",
  "a",
  "li",
  "label",
  "strong",
  "em",
  "b",
  // "i",
  "u",
  "s",
  "small",
  "mark",
]);

const IMAGE_TAGS = new Set(["img", "picture", "svg"]);
const TABLE_TAGS = new Set(["table"]);

export const classifyElement = (
  element: HTMLElement,
  win: Window = window,
): ElementType[] => {
  const types: ElementType[] = [];
  const tagName = element.tagName.toLowerCase();

  if (IMAGE_TAGS.has(tagName)) {
    types.push("image");
    return types;
  }

  if (TABLE_TAGS.has(tagName)) {
    types.push("table");
    return types;
  }

  if (tagName === "canvas") {
    const dataChart = element.getAttribute("data-chart");
    if (dataChart) {
      types.push("chart");
    } else {
      types.push("image");
    }
    return types;
  }

  if (tagName === "hr") {
    types.push("line");
    return types;
  }

  const style = win.getComputedStyle(element);

  const singleBorderSide = hasSingleBorderSide(style);
  if (singleBorderSide) {
    types.push("line");
  }

  const hasVisualStyling = checkVisualStyling(style);
  if (hasVisualStyling && !singleBorderSide) {
    types.push("shape");
  }

  if (TEXT_TAGS.has(tagName) && hasDirectTextNode(element)) {
    types.push("text");
  }

  return types;
};

const checkVisualStyling = (style: CSSStyleDeclaration): boolean => {
  const hasBackgroundColor =
    style.backgroundColor !== "transparent" &&
    style.backgroundColor !== "rgba(0, 0, 0, 0)";

  const hasBackgroundImage =
    style.backgroundImage !== "none" && style.backgroundImage !== "";

  const hasBorder =
    parseFloat(style.borderWidth) > 0 &&
    style.borderColor !== "transparent" &&
    style.borderColor !== "rgba(0, 0, 0, 0)";

  const hasShadow = style.boxShadow !== "none" && style.boxShadow !== "";

  const hasBorderRadius = parseFloat(style.borderRadius) > 0;

  return (
    hasBackgroundColor ||
    hasBackgroundImage ||
    hasBorder ||
    hasShadow ||
    hasBorderRadius
  );
};

export const classifyText = (
  tagName: string,
): "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "body" | null => {
  const tag = tagName.toLowerCase();
  if (!TEXT_TAGS.has(tagName)) return null;
  if (/^h[1-6]$/.test(tag))
    return tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  if (tag === "p") return "p";
  return "body";
};

export const classifyShape = (
  style: CSSStyleDeclaration,
  boundingRect: DOMRect,
): "rect" | "ellipse" | "roundRect" => {
  const borderRadius = parseFloat(style.borderRadius) || 0;
  const { width, height } = boundingRect;

  const minDimension = Math.min(width, height);
  const maxRadius = minDimension / 2;

  if (borderRadius >= maxRadius * 0.9) {
    if (Math.abs(width - height) < 2) {
      return "ellipse";
    }
  }

  if (borderRadius > 0) {
    return "roundRect";
  }

  return "rect";
};

const hasDirectTextNode = (element: HTMLElement): boolean => {
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && node.textContent.trim().length > 0) {
        return true;
      }
    }
  }
  return false;
};

export const hasSingleBorderSide = (
  style: CSSStyleDeclaration,
): "left" | "right" | "top" | "bottom" | null => {
  const leftWidth = parseFloat(style.borderLeftWidth) || 0;
  const rightWidth = parseFloat(style.borderRightWidth) || 0;
  const topWidth = parseFloat(style.borderTopWidth) || 0;
  const bottomWidth = parseFloat(style.borderBottomWidth) || 0;

  const sides = [
    { side: "left" as const, width: leftWidth },
    { side: "right" as const, width: rightWidth },
    { side: "top" as const, width: topWidth },
    { side: "bottom" as const, width: bottomWidth },
  ];

  const activeSides = sides.filter((s) => s.width > 0);

  if (activeSides.length === 1) {
    return activeSides[0].side;
  }

  return null;
};
