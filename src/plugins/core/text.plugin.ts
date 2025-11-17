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
import { classifyText, classifyIcon } from "@/lib/extractors/classifier";
import { extractRuns } from "@/lib/extractors/text";
import { COORDINATE_BUFFER } from "@/constants";

const adjustBoundsForInlineIcons = (
  element: HTMLElement,
  rect: DOMRect,
): DOMRect => {
  const iconElements = element.querySelectorAll<HTMLElement>("i");
  let iconOffset = 0;

  for (const icon of iconElements) {
    if (classifyIcon(icon)) {
      const iconRect = icon.getBoundingClientRect();
      const width = iconRect.width;

      const style = icon.ownerDocument.defaultView!.getComputedStyle(icon);
      const marginRight = parseFloat(style.marginRight) || 0;

      iconOffset += width + marginRight;
    }
  }

  return new DOMRect(
    rect.left + iconOffset,
    rect.top,
    rect.width - iconOffset,
    rect.height,
  );
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

    const adjustedRect = adjustBoundsForInlineIcons(element, boundingRect);

    const position = extractRelativePosition(adjustedRect, slideRect);
    const dimensions = extractDimensions(adjustedRect, COORDINATE_BUFFER);

    const runs = extractRuns(element);

    const textElement: TextElementDTO = {
      type: "text",
      id: crypto.randomUUID(),
      content,
      runs: runs.length > 0 ? runs : undefined,
      position: position,
      dimensions: dimensions,
      typography: extractTypography(computedStyle),
      textType,
      padding: extractPadding(computedStyle),
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return textElement;
  },
};
