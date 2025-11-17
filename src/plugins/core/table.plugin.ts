import type { Plugin } from "@/types/plugin.types";
import type { TableElementDTO, TableCellDTO } from "@/types/elements.types";
import type { Border } from "@/types/base.types";
import { extractTypography } from "@/lib/extractors/typography";
import {
  extractRelativePosition,
  extractDimensions,
} from "@/lib/extractors/position";
import { extractStrokeFromBorder } from "@/lib/extractors/stroke";
import { extractFill } from "@/lib/extractors/shape";
import { extractTextContent } from "@/lib/extractors/text";

const extractCellBorder = (style: CSSStyleDeclaration): Border | undefined => {
  const topWidth = parseFloat(style.borderTopWidth) || 0;
  const rightWidth = parseFloat(style.borderRightWidth) || 0;
  const bottomWidth = parseFloat(style.borderBottomWidth) || 0;
  const leftWidth = parseFloat(style.borderLeftWidth) || 0;

  const hasBorder = topWidth > 0 || rightWidth > 0 || bottomWidth > 0 || leftWidth > 0;
  if (!hasBorder) return undefined;

  const border: Border = {};

  if (topWidth > 0) {
    border.top = extractStrokeFromBorder(
      style.borderTopColor,
      topWidth,
      style.borderTopStyle,
    );
  }

  if (rightWidth > 0) {
    border.right = extractStrokeFromBorder(
      style.borderRightColor,
      rightWidth,
      style.borderRightStyle,
    );
  }

  if (bottomWidth > 0) {
    border.bottom = extractStrokeFromBorder(
      style.borderBottomColor,
      bottomWidth,
      style.borderBottomStyle,
    );
  }

  if (leftWidth > 0) {
    border.left = extractStrokeFromBorder(
      style.borderLeftColor,
      leftWidth,
      style.borderLeftStyle,
    );
  }

  return border;
};

const parseTableCell = (cell: HTMLTableCellElement): TableCellDTO => {
  const doc = cell.ownerDocument;
  const style = doc.defaultView!.getComputedStyle(cell);

  let fill = extractFill(style);
  let border = extractCellBorder(style);

  const row = cell.parentElement;
  if (row) {
    const rowStyle = doc.defaultView!.getComputedStyle(row);
    if (!fill) {
      fill = extractFill(rowStyle);
    }
    if (!border) {
      border = extractCellBorder(rowStyle);
    }
  }

  const cellDTO: TableCellDTO = {
    id: crypto.randomUUID(),
    text: extractTextContent(cell),
    typography: extractTypography(style),
    fill: fill,
    border: border,
  };

  if (cell.colSpan > 1) {
    cellDTO.colspan = cell.colSpan;
  }

  if (cell.rowSpan > 1) {
    cellDTO.rowspan = cell.rowSpan;
  }

  return cellDTO;
};

const parseTableRows = (table: HTMLTableElement): TableCellDTO[][] => {
  const rows: TableCellDTO[][] = [];
  const tableRows = table.querySelectorAll("tr");

  for (const row of tableRows) {
    const cells: TableCellDTO[] = [];
    const tableCells = row.querySelectorAll<HTMLTableCellElement>("th, td");

    for (const cell of tableCells) {
      cells.push(parseTableCell(cell));
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
};

const extractColumnWidths = (table: HTMLTableElement): number[] => {
  const firstRow = table.querySelector("tr");
  if (!firstRow) return [];

  const cells = firstRow.querySelectorAll<HTMLTableCellElement>("th, td");
  if (cells.length === 0) return [];

  const widths: number[] = [];

  for (const cell of cells) {
    const cellWidth = cell.getBoundingClientRect().width;
    widths.push(cellWidth);
  }

  return widths;
};

export const tablePlugin: Plugin<TableElementDTO> = {
  name: "core:table",
  handles: ["table"],
  onParse: (element, parseContext) => {
    const { boundingRect, slideElement } = parseContext;

    const table = element as HTMLTableElement;
    const slideRect = slideElement.getBoundingClientRect();

    const rows = parseTableRows(table);
    if (rows.length === 0) return null;

    const hasHeader = table.querySelector("thead") !== null;
    const firstRowHasHeader = table.querySelector("th") !== null;
    const colWidths = extractColumnWidths(table);

    const tableElement: TableElementDTO = {
      type: "table",
      id: crypto.randomUUID(),
      position: extractRelativePosition(boundingRect, slideRect),
      dimensions: extractDimensions(boundingRect),
      rows: rows,
      colWidths: colWidths.length > 0 ? colWidths : undefined,
      headerRow: hasHeader || firstRowHasHeader,
    };

    return tableElement;
  },
};
