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
  parseIconClass,
  fetchIconFromCDN,
  createIconSVGDataURI,
} from "@/lib/extractors/fontawesome";
import { sanitizeColor } from "@/utils/sanitize";

export const fontAwesomePlugin: Plugin<ImageElementDTO> = {
  name: "core:icon-fontawesome",
  handles: ["icon"],
  onParse: async (element, parseContext) => {
    const { computedStyle, boundingRect, slideElement } = parseContext;

    const classList = Array.from(element.classList);
    const iconClass = parseIconClass(classList);

    if (!iconClass) return null;

    const variant = detectIconVariant(classList);
    const svgData = await fetchIconFromCDN(iconClass, variant);

    if (!svgData) return null;

    const color = sanitizeColor(computedStyle.color) || "000000";
    const src = createIconSVGDataURI(svgData, color);

    const slideRect = slideElement.getBoundingClientRect();

    const viewBoxParts = svgData.viewBox.split(" ").map(Number);
    const svgWidth = viewBoxParts[2] || 512;
    const svgHeight = viewBoxParts[3] || 512;
    const svgAspectRatio = svgWidth / svgHeight;

    let finalWidth = boundingRect.width;
    let finalHeight = boundingRect.height;

    const heightBasedWidth = finalHeight * svgAspectRatio;
    const widthBasedHeight = finalWidth / svgAspectRatio;

    if (heightBasedWidth <= finalWidth) {
      finalWidth = heightBasedWidth;
    } else {
      finalHeight = widthBasedHeight;
    }

    const imageElement: ImageElementDTO = {
      type: "image",
      originalType: "icon",
      id: crypto.randomUUID(),
      src: src,
      alt: iconClass,
      position: extractRelativePosition(boundingRect, slideRect),
      dimensions: { width: finalWidth, height: finalHeight },
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return imageElement;
  },
};
