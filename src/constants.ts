import { Plugin } from "@/types/plugin.types";
import { textPlugin } from "@/plugins/core/text";

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
} as const;

export const SERIALIZER = {
  DPI: 96,
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

export const NAMED_COLORS: Record<string, string> = {
  black: "000000",
  white: "FFFFFF",
  red: "FF0000",
  green: "008000",
  blue: "0000FF",
  yellow: "FFFF00",
  cyan: "00FFFF",
  magenta: "FF00FF",
  gray: "808080",
  grey: "808080",
  orange: "FFA500",
  purple: "800080",
  pink: "FFC0CB",
  brown: "A52A2A",
  transparent: "FFFFFF",
} as const;

export const DEFAULT_CORE_PLUGINS: Plugin[] = [textPlugin];
