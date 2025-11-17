# html-in-pptx-out

Convert HTML to PowerPoint with a plugin architecture.

[![npm version](https://img.shields.io/npm/v/html-in-pptx-out.svg)](https://www.npmjs.com/package/html-in-pptx-out)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install html-in-pptx-out pptxgenjs
```

## Quick Start

```typescript
import { HtmlToPptx } from "html-in-pptx-out";

const html = `
  <div class="slide">
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;

const converter = new HtmlToPptx();
await converter.load(html).convert();

const buffer = await converter.export({
  format: "pptx",
  filename: "output.pptx",
});
```

## CLI

```bash
npx html-in-pptx-out input.html output.pptx
npx html-in-pptx-out input.html output.pptx --selector ".page"
```

## Core Plugins

Built-in plugins for common element types:

- `core:text` - Text elements with typography
- `core:shape` - Rectangles, rounded rectangles with fill/stroke
- `core:image` - Images (base64, URLs)
- `core:table` - HTML tables
- `core:line` - Horizontal/vertical lines
- `core:chart-plotly` - Plotly.js charts
- `core:fontawesome` - Font Awesome icons

## Architecture

```
HTML → Parser → Plugins (onParse) → ElementDTOs → Plugins (onSlide) → Serializer → PPTX
```

### Plugin Lifecycle

1. **beforeParse** - Modify HTML before parsing
2. **onParse** - Transform DOM element to ElementDTO
3. **onSlide** - Modify slide after all elements parsed
4. **afterGenerate** - Post-process the PPTX object

### Custom Plugin

```typescript
import { Plugin, TextElementDTO } from "html-in-pptx-out";

const myPlugin: Plugin<TextElementDTO> = {
  name: "my-plugin",
  handles: ["text"],
  onParse: (element, context) => {
    return {
      type: "text",
      id: crypto.randomUUID(),
      content: element.textContent || "",
      position: {
        left: context.boundingRect.left,
        top: context.boundingRect.top,
      },
      dimensions: {
        width: context.boundingRect.width,
        height: context.boundingRect.height,
      },
    };
  },
};

const converter = new HtmlToPptx().use(myPlugin);
```

## API

```typescript
class HtmlToPptx {
  constructor(config?: {
    selector?: string;           // default: ".slide"
    dimensions?: { width: number; height: number };
    plugins?: { core?: Plugin[]; extensions?: Plugin[] };
  });

  load(html: string): this;
  use(plugin: Plugin): this;
  convert(): Promise<this>;
  export(options: ExportConfig): Promise<ArrayBuffer>;
  getPresentation(): PresentationDTO;
}
```

## Types

Core types exported from the package:

- `ElementDTO` - Union of all element types
- `TextElementDTO`, `ShapeElementDTO`, `ImageElementDTO`, etc.
- `Position`, `Dimensions`, `Typography`, `Fill`, `Stroke`
- `Plugin`, `ParseContext`, `PluginContext`
- `PresentationDTO`, `SlideDTO`

See [docs/api.md](docs/api.md) for full type reference.

## Demo

```bash
npm run demo
# Open http://localhost:3000/demo
```

## Requirements

- Node.js >= 20.19.0
- pptxgenjs ^3.12.0 (peer dependency)

## License

MIT
