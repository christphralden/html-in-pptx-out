import { Plugin } from "@/types/plugin.types";
import { textPlugin } from "@/plugins/core/text.plugin";
import { shapePlugin } from "@/plugins/core/shape.plugin";
import { linePlugin } from "@/plugins/core/line.plugin";
import { tablePlugin } from "@/plugins/core/table.plugin";
import { plotlyPlugin } from "@/plugins/core/plotly.plugin";
import { imagePlugin } from "@/plugins/core/image.plugin";
import { iconPlugin } from "@/plugins/core/icon.plugin";

export const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
} as const;

export const DEFAULTS = {
  SLIDE_SELECTOR: ".slide",
  SLIDE_WIDTH: 992,
  SLIDE_HEIGHT: 558,
  FONT_FAMILY: "",
  CHART_FONT_SIZE: 10,
} as const;

export const SERIALIZER = {
  DPI: 96,
  PPTX_PIXELS_TO_INCHES: 73.7,
  RADIUS_MULTIPLIER: 0.75,
} as const;

export const FONT_WEIGHT_SUFFIX_MAP: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
} as const;

export const DEFAULT_CORE_PLUGINS: Plugin[] = [
  textPlugin,
  shapePlugin,
  linePlugin,
  tablePlugin,
  imagePlugin,
  iconPlugin,
  plotlyPlugin,
];
export const COORDINATE_BUFFER = 1.02 as const;

export const CHART_TYPE_MAP: Record<string, string> = {
  pie: "pie",
  bar: "bar",
  line: "line",
  scatter: "scatter",
  area: "area",
  doughnut: "doughnut",
  radar: "radar",
  bubble: "bubble",
} as const;

export const PPTX_CHART_TYPE_MAP: Record<string, string> = {
  pie: "pie",
  bar: "bar",
  line: "line",
  scatter: "line",
  area: "area",
  doughnut: "doughnut",
  radar: "radar",
  bubble: "bubble",
} as const;

export const FA5_TO_FA6_NAMES: Record<string, string> = {
  "check-circle": "circle-check",
  "times-circle": "circle-xmark",
  "exclamation-circle": "circle-exclamation",
  "exclamation-triangle": "triangle-exclamation",
  "shield-alt": "shield",
  search: "magnifying-glass",
  times: "xmark",
  bars: "bars",
  cog: "gear",
  trash: "trash-can",
  edit: "pen-to-square",
  "external-link-alt": "arrow-up-right-from-square",
  "arrow-alt-circle-down": "circle-down",
  "arrow-alt-circle-up": "circle-up",
  "arrow-alt-circle-left": "circle-left",
  "arrow-alt-circle-right": "circle-right",
  "sign-in-alt": "right-to-bracket",
  "sign-out-alt": "right-from-bracket",
  percentage: "percent",
} as const;
