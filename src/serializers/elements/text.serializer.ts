import type { TextElementDTO, TextRun } from "@/types/elements.types";
import type { Dimensions, Typography } from "@/types/base.types";
import type PptxGenJS from "pptxgenjs";
import {
  positionToPercentage,
  dimensionsToPercentage,
  pxToPoints,
} from "../utils/units";
import { FONT_WEIGHT_SUFFIX_MAP } from "@/constants";

const transformFontfactToPptxFontface = (
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

const transformTypographyToPptxTextProps = (
  typo: Typography,
): PptxGenJS.TextPropsOptions => {
  const props: PptxGenJS.TextPropsOptions = {};

  if (typo.fontFamily) {
    props.fontFace = transformFontfactToPptxFontface(
      typo.fontFamily,
      typo.fontWeight,
    );
  }

  if (typo.fontSize) {
    props.fontSize = pxToPoints(typo.fontSize);
  }

  if (typo.color) {
    props.color = typo.color.toUpperCase();
  }

  if (typo.fontWeight) {
    const weight = parseInt(typo.fontWeight, 10) || 400;
    if (weight > 400) {
      props.bold = true;
    }
  }

  if (typo.fontStyle === "italic" || typo.fontStyle === "oblique") {
    props.italic = true;
  }

  if (typo.underline) {
    props.underline = { style: "sng" };
  }

  if (typo.strikethrough) {
    props.strike = "sngStrike";
  }

  return props;
};

const flattenRuns = (
  runs: TextRun[],
): Array<{ text: string; options: PptxGenJS.TextPropsOptions }> => {
  const result: Array<{ text: string; options: PptxGenJS.TextPropsOptions }> =
    [];

  for (const run of runs) {
    if (run.children && run.children.length > 0) {
      const childResults = flattenRuns(run.children);
      for (const child of childResults) {
        const aggregatedOptions = { ...child.options };

        if (run.typography) {
          const runProps = transformTypographyToPptxTextProps(run.typography);
          Object.assign(aggregatedOptions, runProps, child.options);
        }

        if (run.href) {
          aggregatedOptions.hyperlink = { url: run.href };
        }

        result.push({ text: child.text, options: aggregatedOptions });
      }
    } else {
      const options: PptxGenJS.TextPropsOptions = {};

      if (run.typography) {
        Object.assign(
          options,
          transformTypographyToPptxTextProps(run.typography),
        );
      }

      if (run.href) {
        options.hyperlink = { url: run.href };
      }

      result.push({ text: run.content, options: options });
    }
  }

  return result;
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
    const typoProps = transformTypographyToPptxTextProps(typo);
    Object.assign(textOptions, typoProps);

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

    if (typo.letterSpacing) {
      textOptions.charSpacing = typo.letterSpacing;
    }
  }

  if (element.padding) {
    textOptions.margin = [
      pxToPoints(element.padding.left),
      pxToPoints(element.padding.right),
      pxToPoints(element.padding.top),
      pxToPoints(element.padding.bottom),
    ];
  }

  if (element.rotation) {
    textOptions.rotate = element.rotation;
  }

  if (element.opacity !== undefined && element.opacity < 1) {
    textOptions.transparency = Math.round((1 - element.opacity) * 100);
  }

  if (element.runs && element.runs.length > 0) {
    const textProps = flattenRuns(element.runs);
    slide.addText(textProps, textOptions);
  } else {
    // if parser does not support runs fallback
    slide.addText(element.content, textOptions);
  }
};
