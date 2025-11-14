import PptxGenJS from 'pptxgenjs';
import type { PresentationDTO } from '@/types/dto.types';
import type { ExportOptions } from '@/types/config.types';

export class PptxSerializer {
  async serialize(presentation: PresentationDTO): Promise<PptxGenJS> {
    const pptx = new PptxGenJS();

    if (presentation.metadata.title) {
      pptx.title = presentation.metadata.title;
    }
    if (presentation.metadata.author) {
      pptx.author = presentation.metadata.author;
    }
    if (presentation.metadata.subject) {
      pptx.subject = presentation.metadata.subject;
    }

    for (const slideDto of presentation.slides) {
      const slide = pptx.addSlide();

      for (const element of slideDto.elements) {
        this.addElementToSlide(slide, element);
      }

      if (slideDto.background) {
        this.applyBackground(slide, slideDto.background);
      }
    }

    return pptx;
  }

  private addElementToSlide(slide: any, element: any): void {
    switch (element.type) {
      case 'text':
        this.addTextElement(slide, element);
        break;
      case 'image':
        this.addImageElement(slide, element);
        break;
      case 'chart':
        this.addChartElement(slide, element);
        break;
      case 'shape':
        this.addShapeElement(slide, element);
        break;
    }
  }

  private addTextElement(slide: any, element: any): void {
    const options: any = {
      x: element.position.x,
      y: element.position.y,
    };

    if (element.styles.fontSize) {
      options.fontSize = element.styles.fontSize;
    }
    if (element.styles.fontFace) {
      options.fontFace = element.styles.fontFace;
    }
    if (element.styles.color) {
      options.color = element.styles.color;
    }
    if (element.styles.bold) {
      options.bold = element.styles.bold;
    }
    if (element.styles.italic) {
      options.italic = element.styles.italic;
    }
    if (element.styles.align) {
      options.align = element.styles.align;
    }

    slide.addText(element.content, options);
  }

  private addImageElement(slide: any, element: any): void {
    const options: any = {
      x: element.position.x,
      y: element.position.y,
      w: element.dimensions.width,
      h: element.dimensions.height,
    };

    slide.addImage({ path: element.src, ...options });
  }

  private addChartElement(slide: any, element: any): void {
    const options: any = {
      x: element.position.x,
      y: element.position.y,
    };

    slide.addChart(element.chartType, element.data.datasets, options);
  }

  private addShapeElement(slide: any, element: any): void {
    const options: any = {
      x: element.position.x,
      y: element.position.y,
      w: element.dimensions.width,
      h: element.dimensions.height,
    };

    if (element.styles.fill) {
      options.fill = element.styles.fill;
    }
    if (element.styles.stroke) {
      options.line = element.styles.stroke;
    }

    slide.addShape(element.shapeType, options);
  }

  private applyBackground(slide: any, background: any): void {
    if (background.type === 'color') {
      slide.background = { color: background.value };
    } else if (background.type === 'image') {
      slide.background = { path: background.value };
    }
  }

  async save(pptx: PptxGenJS, options: ExportOptions): Promise<void> {
    const outputPath = options.path
      ? `${options.path}/${options.filename}`
      : options.filename;

    await pptx.writeFile({ fileName: outputPath });
  }
}
