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

const extractImageSrc = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "img") {
    return (element as HTMLImageElement).src || "";
  }

  if (tagName === "svg") {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(element);
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  }

  if (tagName === "picture") {
    const img = element.querySelector("img");
    if (img) {
      return img.src || "";
    }
  }

  return "";
};

const extractImageAlt = (element: HTMLElement): string | undefined => {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "img") {
    return (element as HTMLImageElement).alt || undefined;
  }

  if (tagName === "svg") {
    const title = element.querySelector("title");
    if (title) {
      return title.textContent || undefined;
    }
  }

  return undefined;
};

export const imagePlugin: Plugin<ImageElementDTO> = {
  name: "core:image",
  handles: ["image"],
  onParse: (element, parseContext) => {
    const { computedStyle, boundingRect, slideElement } = parseContext;

    const slideRect = slideElement.getBoundingClientRect();
    const src = extractImageSrc(element);

    if (!src) return null;

    const imageElement: ImageElementDTO = {
      type: "image",
      id: crypto.randomUUID(),
      src: src,
      alt: extractImageAlt(element),
      position: extractRelativePosition(boundingRect, slideRect),
      dimensions: extractDimensions(boundingRect),
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return imageElement;
  },
};
