import type { SerializerStrategy, ExportConfig } from "@/types/config.types";
import type { PresentationDTO } from "@/types/presentation.types";
import type { PluginManagerInterface } from "@/types/plugin.types";
import PptxGenJS from "pptxgenjs";
import { pxToInches } from "./utils/units";
import { serializeText } from "./elements/text.serializer";

export class PptxSerializer implements SerializerStrategy {
  private pluginManager: PluginManagerInterface | null = null;

  setPluginManager(pluginManager: PluginManagerInterface): void {
    this.pluginManager = pluginManager;
  }

  async serialize(
    presentation: PresentationDTO,
    _options: ExportConfig,
  ): Promise<ArrayBuffer> {
    const pptx = new PptxGenJS();

    const widthInches = pxToInches(presentation.viewport.width);
    const heightInches = pxToInches(presentation.viewport.height);

    pptx.defineLayout({
      name: "CUSTOM",
      width: widthInches,
      height: heightInches,
    });
    pptx.layout = "CUSTOM";

    if (presentation.metadata.title) {
      pptx.title = presentation.metadata.title;
    }
    if (presentation.metadata.author) {
      pptx.author = presentation.metadata.author;
    }
    if (presentation.metadata.subject) {
      pptx.subject = presentation.metadata.subject;
    }

    for (const slideDTO of presentation.slides) {
      const slide = pptx.addSlide();

      for (const element of slideDTO.elements) {
        switch (element.type) {
          case "text":
            serializeText(slide, element, presentation.viewport);
            break;
          case "image":
            break;
          case "shape":
            break;
          case "table":
            break;
          case "chart":
            break;
          case "line":
            break;
        }
      }
    }

    if (this.pluginManager) {
      await this.pluginManager.executeAfterGenerate(pptx, presentation);
    }

    const buffer = await pptx.write({ outputType: "arraybuffer" });
    return buffer as ArrayBuffer;
  }
}
