import type { ConverterConfig } from "@/types/config.types";
import { BaseConverter } from "./base-converter";
import { DEFAULT_CORE_PLUGINS, DEFAULTS } from "@/constants";
import { IframeParser } from "@/parsers/iframe";
import { PptxSerializer } from "@/serializers/pptx";

export class HtmlToPptx extends BaseConverter {
  constructor(config: Partial<ConverterConfig> = {}) {
    super({
      selector: config.selector || DEFAULTS.SLIDE_SELECTOR,
      dimensions: config.dimensions || {
        width: DEFAULTS.SLIDE_WIDTH,
        height: DEFAULTS.SLIDE_HEIGHT,
      },
      plugins: {
        core: config.plugins?.core ?? DEFAULT_CORE_PLUGINS,
        extensions: config.plugins?.extensions ?? [],
      },
      parser: config.parser || new IframeParser(),
      serializer: config.serializer || new PptxSerializer(),
      debug: config.debug,
    });
  }
}
