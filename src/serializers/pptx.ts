import type { SerializerStrategy, ExportConfig } from "@/types/config.types";
import type { PresentationDTO } from "@/types/presentation.types";

export class PptxSerializer implements SerializerStrategy {
  async serialize(
    _presentation: PresentationDTO,
    _options: ExportConfig,
  ): Promise<ArrayBuffer> {
    throw new Error("PptxSerializer not implemented");
  }
}
