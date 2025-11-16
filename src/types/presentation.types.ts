import type { Dimensions, Fill, Typography } from "./base.types";
import type { ElementDTO } from "./elements.types";

export interface SlideBackground {
  fill: Fill;
}

export interface SlideDTO {
  id: string;
  order: number;
  elements: ElementDTO[];
  background?: SlideBackground;
}

export interface PresentationMetadata {
  title?: string;
  author?: string;
  subject?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  plugins?: string[];
}

export interface PresentationDTO {
  slides: SlideDTO[];
  metadata: PresentationMetadata;
  viewport: Dimensions;
  fonts?: Record<string, Typography>;
}
