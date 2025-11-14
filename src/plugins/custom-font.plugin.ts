import type { Plugin } from '@/types/plugin.types';

export interface CustomFontPluginOptions {
  fontFace: string;
  applyToAll?: boolean;
  targetSelectors?: string[];
}

export function createCustomFontPlugin(
  options: CustomFontPluginOptions
): Plugin {
  return {
    name: 'custom-font',
    version: '1.0.0',
    onSlide: async (slide, context) => {
      if (!options.applyToAll) {
        return slide;
      }

      return {
        ...slide,
        elements: slide.elements.map((element) => {
          if (element.type === 'text') {
            return {
              ...element,
              styles: {
                ...element.styles,
                fontFace: options.fontFace,
              },
            };
          }
          return element;
        }),
      };
    },
  };
}
