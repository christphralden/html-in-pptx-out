import type { TableElementDTO } from "@/types/elements.types";
import type { Dimensions } from "@/types/base.types";
import type PptxGenJS from "pptxgenjs";
import { positionToPercentage, dimensionsToPercentage, pxToPoints } from "../utils/units";
import { FONT_WEIGHT_SUFFIX_MAP } from "@/constants";

const getFontFaceWithWeight = (fontFamily: string, fontWeight?: string): string => {
  const baseFontFace = fontFamily.split(",")[0].trim();
  if (!fontWeight) return baseFontFace;

  const weight = parseInt(fontWeight, 10) || 400;
  const suffix = FONT_WEIGHT_SUFFIX_MAP[weight];

  if (!suffix || suffix === "") return baseFontFace;

  return `${baseFontFace} ${suffix}`;
};

export const serializeTable = (
  slide: PptxGenJS.Slide,
  element: TableElementDTO,
  viewport: Dimensions,
): void => {
  const pos = positionToPercentage(element.position, viewport);
  const dims = dimensionsToPercentage(element.dimensions, viewport);

  const rows: PptxGenJS.TableRow[] = element.rows.map((row) =>
    row.map((cell) => {
      const cellProps: PptxGenJS.TableCell = {
        text: cell.text,
      };

      if (cell.colspan) {
        cellProps.options = {
          ...cellProps.options,
          colspan: cell.colspan,
        };
      }

      if (cell.rowspan) {
        cellProps.options = {
          ...cellProps.options,
          rowspan: cell.rowspan,
        };
      }

      if (cell.typography) {
        const typo = cell.typography;
        const weight = typo.fontWeight ? parseInt(typo.fontWeight, 10) || 400 : 400;

        cellProps.options = {
          ...cellProps.options,
          fontFace: typo.fontFamily
            ? getFontFaceWithWeight(typo.fontFamily, typo.fontWeight)
            : undefined,
          fontSize: typo.fontSize ? pxToPoints(typo.fontSize) : undefined,
          color: typo.color ? typo.color.toUpperCase() : undefined,
          bold: weight >= 700,
          italic: typo.fontStyle === "italic" || typo.fontStyle === "oblique",
          align: typo.textAlign as "left" | "center" | "right" | undefined,
          valign: typo.verticalAlign as "top" | "middle" | "bottom" | undefined,
        };
      }

      if (cell.fill && cell.fill.type === "solid") {
        cellProps.options = {
          ...cellProps.options,
          fill: { color: cell.fill.color.toUpperCase() },
        };
      }

      if (cell.border) {
        const borderOptions: PptxGenJS.TableCellProps["border"] = [];
        const sides = ["top", "right", "bottom", "left"] as const;

        for (const side of sides) {
          const stroke = cell.border[side];
          if (stroke) {
            borderOptions.push({
              color: stroke.color.toUpperCase(),
              pt: stroke.width,
              type: stroke.style === "dashed" ? "dash" : stroke.style === "dotted" ? "dot" : "solid",
            });
          } else {
            borderOptions.push({ type: "none" });
          }
        }

        cellProps.options = {
          ...cellProps.options,
          border: borderOptions,
        };
      }

      return cellProps;
    }),
  );

  const tableOptions: PptxGenJS.TableProps = {
    x: pos.x,
    y: pos.y,
    w: dims.w,
    h: dims.h,
  };

  if (element.cellMinHeight) {
    tableOptions.rowH = pxToPoints(element.cellMinHeight) / 72;
  }

  slide.addTable(rows, tableOptions);
};
