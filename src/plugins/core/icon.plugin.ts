import type { Plugin } from "@/types/plugin.types";
import type { ImageElementDTO } from "@/types/elements.types";
import {
  extractRelativePosition,
  extractDimensions,
} from "@/lib/extractors/position";
import {
  extractRotation,
  extractOpacity,
  extractZIndex,
} from "@/lib/extractors/typography";
import {
  detectIconVariant,
  extractIconClass,
  fetchIconFromCDN,
  createIconSVGDataURI,
} from "@/lib/extractors/icon";
import { sanitizeColor } from "@/utils/sanitize";

export const iconPlugin: Plugin<ImageElementDTO> = {
  name: "core:icon",
  handles: ["icon"],
  onParse: async (element, parseContext) => {
    const { computedStyle, boundingRect, slideElement } = parseContext;

    const classList = Array.from(element.classList);
    const iconClass = extractIconClass(classList);

    if (!iconClass) return null;

    const variant = detectIconVariant(classList);
    const svgData = await fetchIconFromCDN(iconClass, variant);

    if (!svgData) return null;

    const color = sanitizeColor(computedStyle.color) || "000000";
    const src = createIconSVGDataURI(svgData, color);

    const slideRect = slideElement.getBoundingClientRect();

    const imageElement: ImageElementDTO = {
      type: "image",
      originalType: "icon",
      id: crypto.randomUUID(),
      src: src,
      alt: iconClass,
      position: extractRelativePosition(boundingRect, slideRect),
      dimensions: extractDimensions(boundingRect),
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return imageElement;
  },
};
