import { DEFAULTS } from "@/constants";

export const extractBullet = (
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration,
  indent: number = DEFAULTS.BASE_INDENT,
):
  | { type: "bullet" | "number"; indent?: number; numberStartAt?: number }
  | undefined => {
  if (element.tagName !== "LI") return undefined;

  const parent = element.parentElement;
  if (!parent) return undefined;

  if (parent.tagName === "UL" || parent.tagName === "OL") {
    const parentStyle =
      parent.ownerDocument.defaultView!.getComputedStyle(parent);
    const listStyleType = computedStyle.listStyleType || parentStyle.listStyleType;

    const siblings = Array.from(parent.children).filter(
      (el) => el.tagName === "LI",
    );
    const index = siblings.indexOf(element) + 1;

    if (listStyleType === "decimal" || listStyleType.includes("decimal")) {
      return { type: "number", indent: indent, numberStartAt: index };
    }

    if (parent.tagName === "OL") {
      return { type: "number", indent: indent, numberStartAt: index };
    }

    return { type: "bullet", indent: indent };
  }

  return undefined;
};
