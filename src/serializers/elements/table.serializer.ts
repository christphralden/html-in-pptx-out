import type { TableElementDTO } from "@/types/elements.types";
import type { Dimensions } from "@/types/base.types";
import type PptxGenJS from "pptxgenjs";
import { dimensionsToPercentage } from "@/utils/units";
import { positionToPercentage } from "@/utils/units";
import { pxToPoints } from "@/utils/units";
import { pxToInches } from "@/utils/units";
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
          bold: weight > 400,
          italic: typo.fontStyle === "italic" || typo.fontStyle === "oblique",
          underline: typo.underline ? { style: "sng" } : undefined,
          strike: typo.strikethrough ? true : undefined,
          align: typo.textAlign as "left" | "center" | "right" | undefined,
          valign: typo.verticalAlign as "top" | "middle" | "bottom" | undefined,
        };
      }

      if (cell.fill) {
        if (cell.fill.type === "solid") {
          const fillOptions: { color: string; transparency?: number } = {
            color: cell.fill.color.toUpperCase(),
          };

          if (cell.fill.opacity !== undefined && cell.fill.opacity < 1) {
            fillOptions.transparency = Math.round((1 - cell.fill.opacity) * 100);
          }

          cellProps.options = {
            ...cellProps.options,
            fill: fillOptions,
          };
        } else if (cell.fill.type === "gradient") {
          const firstStop = cell.fill.stops[0];
          if (firstStop) {
            cellProps.options = {
              ...cellProps.options,
              fill: { color: firstStop.color.toUpperCase() },
            };
          }
        }
      }

      if (cell.border) {
        const borderOptions: PptxGenJS.TableCellProps["border"] = [];
        const sides = ["top", "right", "bottom", "left"] as const;

        for (const side of sides) {
          const stroke = cell.border[side];
          if (stroke) {
            let borderType: "solid" | "dash" | "none" = "solid";
            if (stroke.style === "dashed" || stroke.style === "dotted") {
              borderType = "dash";
            }

            borderOptions.push({
              color: stroke.color.toUpperCase(),
              pt: stroke.width,
              type: borderType,
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

  if (element.colWidths && element.colWidths.length > 0) {
    tableOptions.colW = element.colWidths.map((widthPx) => pxToInches(widthPx));
  }

  if (element.cellMinHeight) {
    tableOptions.rowH = pxToPoints(element.cellMinHeight) / 72;
  }

  if (element.headerRow) {
    tableOptions.firstRowHeader = true;
  }

  slide.addTable(rows, tableOptions);
};
