import type { HTMLParser, ParsedHTML, HTMLElement } from '@/types/config.types';
import type { Config } from '@/types/dto.types';

export class DefaultHTMLParser implements HTMLParser {
  async parse(html: string, config: Config): Promise<ParsedHTML> {
    const slides = this.extractSlides(html, config);
    const metadata = this.extractMetadata(html);

    return {
      slides,
      metadata,
    };
  }

  private extractSlides(html: string, config: Config): HTMLElement[] {
    const slideSelector = config.slideSelector;
    return [];
  }

  private extractMetadata(html: string): Record<string, string> {
    return {};
  }

  private parseElement(element: string): HTMLElement {
    return {
      tag: 'div',
      attributes: {},
      children: [],
      textContent: '',
    };
  }
}
