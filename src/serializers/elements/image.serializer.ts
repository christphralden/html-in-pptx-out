import type { ImageElementDTO } from "@/types/elements.types";
import type { Dimensions } from "@/types/base.types";
import type PptxGenJS from "pptxgenjs";
import { dimensionsToPercentage } from "@/utils/units";
import { positionToPercentage } from "@/utils/units";

export const serializeImage = (
  slide: PptxGenJS.Slide,
  element: ImageElementDTO,
  viewport: Dimensions,
): void => {
  const pos = positionToPercentage(element.position, viewport);
  const dims = dimensionsToPercentage(element.dimensions, viewport);

  const imageOptions: PptxGenJS.ImageProps = {
    x: pos.x,
    y: pos.y,
    w: dims.w,
    h: dims.h,
  };

  if (element.src.startsWith("data:")) {
    imageOptions.data = element.src;
  } else {
    imageOptions.path = element.src;
  }

  if (element.alt) {
    imageOptions.altText = element.alt;
  }

  if (element.rotation) {
    imageOptions.rotate = element.rotation;
  }

  if (element.opacity !== undefined && element.opacity < 1) {
    imageOptions.transparency = Math.round((1 - element.opacity) * 100);
  }

  if (element.fit) {
    const fitMap: Record<string, "contain" | "cover" | "crop"> = {
      contain: "contain",
      cover: "cover",
      stretch: "crop",
    };
    imageOptions.sizing = {
      type: fitMap[element.fit] || "contain",
      w: element.dimensions.width,
      h: element.dimensions.height,
    };
  }

  slide.addImage(imageOptions);
};
