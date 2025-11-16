import type { TextElementDTO } from "@/types/elements.types";
import type { Dimensions } from "@/types/base.types";
import type PptxGenJS from "pptxgenjs";
import {
  positionToPercentage,
  dimensionsToPercentage,
  pxToPoints,
} from "../utils/units";
import { FONT_WEIGHT_SUFFIX_MAP } from "@/constants";

const getFontFaceWithWeight = (
  fontFamily: string,
  fontWeight?: string,
): string => {
  const baseFontFace = fontFamily.split(",")[0].trim();
  if (!fontWeight) return baseFontFace;

  const weight = parseInt(fontWeight, 10) || 400;
  const suffix = FONT_WEIGHT_SUFFIX_MAP[weight];

  if (!suffix || suffix === "") return baseFontFace;

  return `${baseFontFace} ${suffix}`;
};

export const serializeText = (
  slide: PptxGenJS.Slide,
  element: TextElementDTO,
  viewport: Dimensions,
): void => {
  const pos = positionToPercentage(element.position, viewport);
  const dims = dimensionsToPercentage(element.dimensions, viewport);

  const textOptions: PptxGenJS.TextPropsOptions = {
    x: pos.x,
    y: pos.y,
    w: dims.w,
    h: dims.h,
    /*
     * I'm setting lineSpacingMultiple to one bcs its not vertically aligned well idk why
     * Default line height to 1 for accurate vertical positioning.
     * Without this, pptxgenjs uses its own default which is shit
     */
    lineSpacingMultiple: 1,
    valign: "top",
    align: "left",
    isTextBox: true,
    wrap: true,
    shrinkText: false,
  };

  if (element.typography) {
    const typo = element.typography;

    if (typo.fontFamily) {
      textOptions.fontFace = getFontFaceWithWeight(
        typo.fontFamily,
        typo.fontWeight,
      );
    }

    if (typo.fontSize) {
      textOptions.fontSize = pxToPoints(typo.fontSize);
    }

    if (typo.color) {
      textOptions.color = typo.color.toUpperCase();
    }

    if (typo.fontWeight) {
      const weight = parseInt(typo.fontWeight, 10) || 400;
      if (weight > 400) {
        textOptions.bold = true;
      }
    }

    if (typo.fontStyle === "italic" || typo.fontStyle === "oblique") {
      textOptions.italic = true;
    }

    if (typo.underline) {
      textOptions.underline = { style: "sng" };
    }

    if (typo.strikethrough) {
      textOptions.strike = "sngStrike";
    }

    if (typo.textAlign) {
      textOptions.align = typo.textAlign as
        | "left"
        | "center"
        | "right"
        | "justify";
    }

    if (typo.verticalAlign) {
      textOptions.valign = typo.verticalAlign as "top" | "middle" | "bottom";
    }

    // if (typo.lineHeight && typo.fontSize) {
    //   const lineSpacingMultiple = typo.lineHeight / typo.fontSize;
    //   textOptions.lineSpacingMultiple = Math.round(lineSpacingMultiple * 2) / 2;
    // }

    if (element.padding) {
      // left/right/top/bottom margin - or what pptxgenjs says
      textOptions.margin = [
        pxToPoints(element.padding.left),
        pxToPoints(element.padding.right),
        pxToPoints(element.padding.top),
        pxToPoints(element.padding.bottom),
      ];
    }

    if (typo.letterSpacing) {
      textOptions.charSpacing = typo.letterSpacing;
    }
  }

  if (element.rotation) {
    textOptions.rotate = element.rotation;
  }

  if (element.opacity !== undefined && element.opacity < 1) {
    textOptions.transparency = Math.round((1 - element.opacity) * 100);
  }

  slide.addText(element.content, textOptions);
};
