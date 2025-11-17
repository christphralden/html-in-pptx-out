import type { Plugin } from "@/types/plugin.types";
import type { TextElementDTO, TextRun } from "@/types/elements.types";
import {
  extractTypography,
  extractPadding,
  extractRotation,
  extractOpacity,
  extractZIndex,
} from "@/lib/extractors/typography";
import {
  extractRelativePosition,
  extractDimensions,
} from "@/lib/extractors/position";
import { classifyText } from "@/lib/extractors/classifier";

const extractRuns = (node: Node): TextRun[] => {
  const runs: TextRun[] = [];

  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || "";
      if (text.length > 0) {
        runs.push({ content: text });
      }
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const className = el.className || "";
      const doc = el.ownerDocument;
      const style = doc.defaultView!.getComputedStyle(el);

      const childRuns = extractRuns(el);
      const textType = classifyText(tagName);
      if (!textType) continue;

      const run: TextRun = {
        content: el.textContent || "",
        tagName: tagName,
        className: className,
        typography: extractTypography(style),
        children: childRuns.length > 0 ? childRuns : undefined,
      };

      if (tagName === "a") {
        run.href = el.getAttribute("href") || undefined;
      }

      runs.push(run);
    }
  }

  return runs;
};

export const textPlugin: Plugin<TextElementDTO> = {
  name: "core:text",
  handles: ["text"],
  onParse: (element, parseContext) => {
    const { computedStyle, boundingRect, tagName, slideElement } = parseContext;

    const content = element.textContent?.trim();
    if (!content) return null;

    const textType = classifyText(tagName);
    if (!textType) return null;

    const slideRect = slideElement.getBoundingClientRect();

    const runs = extractRuns(element);

    const textElement: TextElementDTO = {
      type: "text",
      id: crypto.randomUUID(),
      content: content,
      runs: runs.length > 0 ? runs : undefined,
      position: extractRelativePosition(boundingRect, slideRect),
      dimensions: extractDimensions(boundingRect),
      typography: extractTypography(computedStyle),
      textType: textType,
      padding: extractPadding(computedStyle),
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return textElement;
  },
};
