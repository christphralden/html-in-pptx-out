import type { ExportConfig, ParserConfig } from "@/types/config.types";
import type { PresentationDTO, SlideDTO } from "@/types/presentation.types";
import { AbstractConverter } from "./abstract-converter";
import { DEFAULTS } from "@/constants";

export class HtmlToPptx extends AbstractConverter {
  constructor(config: Partial<ParserConfig> = {}) {
    super({
      selector: config.selector || DEFAULTS.SLIDE_SELECTOR,
      dimensions: {
        width: config.dimensions?.width || DEFAULTS.SLIDE_WIDTH,
        height: config.dimensions?.height || DEFAULTS.SLIDE_HEIGHT,
      },
    });
  }

  protected async parse(_html: string): Promise<PresentationDTO> {
    const slides: SlideDTO[] = [];

    return {
      slides,
      metadata: {
        createdAt: new Date(),
      },
      viewport: this.config.dimensions,
    };
  }

  protected async serialize(
    _presentation: PresentationDTO,
    _options: ExportConfig,
  ): Promise<ArrayBuffer> {
    throw new Error("Not implemented");
  }
}
