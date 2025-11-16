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

export const DEFAULT_CORE_PLUGINS: Plugin[] = [textPlugin];
