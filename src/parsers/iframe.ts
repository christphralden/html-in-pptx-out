import type {
  ParserStrategy,
  ParserConfig,
  ParserResult,
  ParserElement,
} from "@/types/config.types";
import type { ParseContext } from "@/types/plugin.types";
import { createIframe, destroyIframe } from "@/lib/iframe-renderer";
import { classifyElement } from "@/lib/extractors/classifier";

export class IframeParser implements ParserStrategy {
  async parse(html: string, config: ParserConfig): Promise<ParserResult> {
    const iframe = await createIframe(html, config.dimensions);
    const doc = iframe.contentDocument!;
    const slideElements = doc.querySelectorAll<HTMLElement>(config.selector);

    const elements: ParserElement[] = [];

    for (let slideIndex = 0; slideIndex < slideElements.length; slideIndex++) {
      const slideElement = slideElements[slideIndex];
      const children = slideElement.querySelectorAll<HTMLElement>("*");

      const allElements = [slideElement, ...Array.from(children)];

      const consumedElements = new Set<HTMLElement>();

      for (const child of allElements) {
        let isConsumed = false;
        let parent = child.parentElement;
        while (parent && parent !== slideElement) {
          if (consumedElements.has(parent)) {
            isConsumed = true;
            break;
          }
          parent = parent.parentElement;
        }
        if (isConsumed) continue;

        const elementTypes = classifyElement(child, iframe.contentWindow!);
        if (elementTypes.length === 0) continue;

        const computedStyle = iframe.contentWindow!.getComputedStyle(child);
        const boundingRect = child.getBoundingClientRect();
        const tagName = child.tagName.toLowerCase();

        for (const elementType of elementTypes) {
          if (elementType === "table" || elementType === "text") {
            consumedElements.add(child);
          }

          const parseContext: ParseContext = {
            elementType: elementType,
            tagName: tagName,
            computedStyle: computedStyle,
            boundingRect: boundingRect,
            slideIndex: slideIndex,
            slideElement: slideElement,
          };

          elements.push({
            slideIndex: slideIndex,
            element: child,
            parseContext: parseContext,
          });
        }
      }
    }

    return {
      elements,
      cleanup: () => destroyIframe(iframe),
    };
  }
}
