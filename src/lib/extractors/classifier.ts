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
  "i",
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
): ElementType | null => {
  const tagName = element.tagName.toLowerCase();

  if (IMAGE_TAGS.has(tagName)) return "image";
  if (TABLE_TAGS.has(tagName)) return "table";

  if (tagName === "canvas") {
    const dataChart = element.getAttribute("data-chart");
    if (dataChart) return "chart";
    return "image";
  }

  if (tagName === "hr") return "line";

  if (TEXT_TAGS.has(tagName)) {
    const hasText = element.textContent?.trim();
    if (hasText) return "text";
  }

  const style = win.getComputedStyle(element);
  const hasBackground =
    style.backgroundColor !== "transparent" &&
    style.backgroundColor !== "rgba(0, 0, 0, 0)";
  const hasBorder = style.borderWidth !== "0px";

  if (hasBackground || hasBorder) return "shape";

  return null;
};

export const classifyText = (
  tagName: string,
): "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "body" => {
  const tag = tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag))
    return tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  if (tag === "p") return "p";
  return "body";
};
