export const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
} as const;

export const DEFAULTS = {
  SLIDE_SELECTOR: ".slide",
  SLIDE_WIDTH: 960,
  SLIDE_HEIGHT: 540,
} as const;
