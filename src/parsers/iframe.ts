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

      for (const child of children) {
        const elementType = classifyElement(child, iframe.contentWindow!);
        if (!elementType) continue;

        const parseContext: ParseContext = {
          elementType: elementType,
          tagName: child.tagName.toLowerCase(),
          computedStyle: iframe.contentWindow!.getComputedStyle(child),
          boundingRect: child.getBoundingClientRect(),
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

    return {
      elements,
      cleanup: () => destroyIframe(iframe),
    };
  }
}
