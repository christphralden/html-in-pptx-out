import type { Plugin } from "@/types/plugin.types";
import type { TextElementDTO } from "@/types/elements.types";
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

export const textPlugin: Plugin = {
  name: "core:text",
  handles: ["text"],
  onParse: (element, parseContext) => {
    const { computedStyle, boundingRect, tagName, slideElement } = parseContext;

    const content = element.textContent?.trim();
    if (!content) return null;

    const slideRect = slideElement.getBoundingClientRect();

    const textElement: TextElementDTO = {
      type: "text",
      id: crypto.randomUUID(),
      content: content,
      position: extractRelativePosition(boundingRect, slideRect),
      dimensions: extractDimensions(boundingRect),
      typography: extractTypography(computedStyle),
      textType: classifyText(tagName),
      padding: extractPadding(computedStyle),
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return textElement;
  },
};
