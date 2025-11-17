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
import { extractRuns } from "@/lib/extractors/text";

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
