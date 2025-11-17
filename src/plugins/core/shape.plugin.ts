import type { Plugin } from "@/types/plugin.types";
import type { ShapeElementDTO } from "@/types/elements.types";
import {
  extractFill,
  extractStroke,
  extractBorderRadius,
} from "@/lib/extractors/shape";
import {
  extractRotation,
  extractOpacity,
  extractZIndex,
} from "@/lib/extractors/typography";
import {
  extractRelativePosition,
  extractDimensions,
} from "@/lib/extractors/position";
import { classifyShape } from "@/lib/extractors/classifier";

export const shapePlugin: Plugin<ShapeElementDTO> = {
  name: "core:shape",
  handles: ["shape"],
  onParse: (_element, parseContext) => {
    const { computedStyle, boundingRect, slideElement } = parseContext;

    const slideRect = slideElement.getBoundingClientRect();

    const shapeElement: ShapeElementDTO = {
      type: "shape",
      id: crypto.randomUUID(),
      shapeType: classifyShape(computedStyle, boundingRect),
      position: extractRelativePosition(boundingRect, slideRect),
      dimensions: extractDimensions(boundingRect),
      fill: extractFill(computedStyle),
      stroke: extractStroke(computedStyle),
      borderRadius: extractBorderRadius(computedStyle),
      zIndex: extractZIndex(computedStyle),
      rotation: extractRotation(computedStyle),
      opacity: extractOpacity(computedStyle),
    };

    return shapeElement;
  },
};
