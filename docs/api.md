# API Reference

## Classes

### HtmlToPptx

Main converter class with sensible defaults.

```typescript
import { HtmlToPptx } from "html-in-pptx-out";

const converter = new HtmlToPptx({
  selector: ".slide",
  dimensions: { width: 992, height: 558 },
});
```

#### Methods

- `load(html: string): this` - Load HTML string
- `use(plugin: Plugin): this` - Register a plugin
- `convert(): Promise<this>` - Parse and convert HTML to DTOs
- `export(options: ExportConfig): Promise<ArrayBuffer>` - Generate PPTX
- `getPresentation(): PresentationDTO` - Get the internal DTO

### BaseConverter

Base class for custom converters. Inject your own parser/serializer.

```typescript
import { BaseConverter, IframeParser, PptxSerializer } from "html-in-pptx-out";

class CustomConverter extends BaseConverter {
  constructor() {
    super({
      selector: ".slide",
      dimensions: { width: 1920, height: 1080 },
      parser: new IframeParser(),
      serializer: new PptxSerializer(),
      plugins: { core: [], extensions: [] },
    });
  }
}
```

## Types

### Element DTOs

```typescript
type ElementType = "text" | "image" | "shape" | "chart" | "table" | "line" | "icon";

interface Elements {
  type: ElementType;
  originalType?: ElementType;
  id: string;
  position: Position;
  dimensions: Dimensions;
  zIndex?: number;
  rotation?: number;
  opacity?: number;
}

interface TextElementDTO extends Elements {
  type: "text";
  content: string;
  runs?: TextRun[];
  typography?: Typography;
  textType?: string;
  autoFit?: boolean;
  vertical?: boolean;
  padding?: Padding;
}

interface TextRun {
  content: string;
  tagName?: string;
  className?: string;
  typography?: Typography;
  href?: string;
  children?: TextRun[];
}

interface ShapeElementDTO extends Elements {
  type: "shape";
  shapeType: string;
  fill?: Fill;
  stroke?: Stroke;
  borderRadius?: number;
  shadow?: Shadow;
}

interface ImageElementDTO extends Elements {
  type: "image";
  src: string;
  alt?: string;
  fixedRatio?: boolean;
}

interface TableElementDTO extends Elements {
  type: "table";
  rows: TableCellDTO[][];
  cellMinHeight?: number;
}

interface TableCellDTO {
  id: string;
  text: string;
  colspan?: number;
  rowspan?: number;
  typography?: Typography;
  fill?: Fill;
  border?: Border;
}

interface ChartElementDTO extends Elements {
  type: "chart";
  data: ChartData;
  sourceLibrary?: SourceLibrary;
}

interface LineElementDTO extends Omit<Elements, "dimensions" | "position"> {
  type: "line";
  start: Position;
  end: Position;
  stroke: Stroke;
}

type ElementDTO =
  | TextElementDTO
  | ShapeElementDTO
  | ImageElementDTO
  | TableElementDTO
  | ChartElementDTO
  | LineElementDTO;
```

### Base Types

```typescript
interface Position {
  left: number;
  top: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Bounds extends Position, Dimensions {}

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Typography {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: "normal" | "italic" | "oblique";
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
  underline?: boolean;
  strikethrough?: boolean;
  textAlign?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
}

type Fill = SolidFill | GradientFill | ImageFill;

interface SolidFill {
  type: "solid";
  color: string;
  opacity?: number;
}

interface GradientFill {
  type: "gradient";
  gradientType: "linear" | "radial";
  angle?: number;
  stops: GradientStop[];
}

interface GradientStop {
  color: string;
  position: number;
  opacity?: number;
}

interface Stroke {
  color: string;
  width: number;
  style: "solid" | "dashed" | "dotted";
  opacity?: number;
}

interface Border {
  top?: Stroke;
  right?: Stroke;
  bottom?: Stroke;
  left?: Stroke;
}

interface Shadow {
  type: "outer" | "inner";
  color: string;
  blur: number;
  offset: { x: number; y: number };
  opacity?: number;
}
```

### Presentation Types

```typescript
interface PresentationDTO {
  slides: SlideDTO[];
  metadata: PresentationMetadata;
  viewport: Dimensions;
  fonts?: Record<string, Typography>;
}

interface SlideDTO {
  id: string;
  order: number;
  elements: ElementDTO[];
  background?: SlideBackground;
}

interface SlideBackground {
  fill: Fill;
}

interface PresentationMetadata {
  title?: string;
  author?: string;
  subject?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  plugins?: string[];
}
```

### Plugin Types

```typescript
interface Plugin<TDTO = ElementDTO, TSerializer = unknown> {
  name: string;
  version?: string;
  handles?: ElementType[];
  beforeParse?: BeforeParseFn;
  onParse?: OnParseFn<TDTO>;
  onSlide?: OnSlideFn;
  afterGenerate?: AfterGenerateFn<TSerializer>;
}

interface ParseContext {
  elementType: ElementType;
  tagName: string;
  computedStyle: CSSStyleDeclaration;
  boundingRect: DOMRect;
  slideIndex: number;
  slideElement: HTMLElement;
}

interface PluginContext {
  presentation?: PresentationDTO;
  metadata: Record<string, unknown>;
  state: Map<string, unknown>;
}

type BeforeParseFn = (
  html: string,
  config: ParserConfig,
  context: PluginContext
) => Promise<string> | string;

type OnParseFn<TDTO> = (
  element: HTMLElement,
  parseContext: ParseContext,
  pluginContext: PluginContext
) => Promise<TDTO | null> | TDTO | null;

type OnSlideFn = (
  slide: SlideDTO,
  context: PluginContext
) => Promise<SlideDTO> | SlideDTO;

type AfterGenerateFn<TSerializer> = (
  serializer: TSerializer,
  presentation: PresentationDTO,
  context: PluginContext
) => Promise<void> | void;
```

### Config Types

```typescript
interface ConverterConfig {
  selector?: string;
  dimensions?: Dimensions;
  plugins?: PluginsConfig;
  parser?: ParserStrategy;
  serializer?: SerializerStrategy;
  debug?: boolean;
}

interface PluginsConfig {
  core?: Plugin[];
  extensions?: Plugin[];
}

interface ParserConfig {
  selector: string;
  dimensions: Dimensions;
  plugins?: PluginsConfig;
}

interface ExportConfig {
  format: "pptx";
  filename: string;
  path?: string;
  compression?: boolean;
}

interface ParserStrategy {
  parse(html: string, config: ParserConfig): Promise<ParserResult>;
}

interface ParserResult {
  elements: ParserElement[];
  cleanup: () => void;
}

interface ParserElement {
  slideIndex: number;
  element: HTMLElement;
  parseContext: ParseContext;
}

interface SerializerStrategy {
  setPluginManager?(manager: PluginManagerInterface): void;
  serialize(presentation: PresentationDTO, options: ExportConfig): Promise<ArrayBuffer>;
}
```

### Chart Types

```typescript
type SourceLibrary = "plotly" | "echarts" | "chartjs" | "unknown";

interface ChartData {
  chartType: string;
  series: ChartSeries[];
  labels: string[];
  options?: ChartOptions;
}

interface ChartSeries {
  name: string;
  values: number[];
  color?: string;
  colors?: string[];
  yAxis?: string;
  chartType?: string;
}

interface ChartOptions {
  title?: string;
  showLegend?: boolean;
  showValue?: boolean;
  showPercent?: boolean;
  showCategoryName?: boolean;
  showSeriesName?: boolean;
  legendPosition?: string;
  valuePosition?: string;
  dataLabelPosition?: string;
  dataLabelColor?: string;
  catAxisLabelColor?: string;
  valAxisLabelColor?: string;
  titleColor?: string;
  legendColor?: string;
  chartColors?: string[];
  barDir?: string;
  barGrouping?: string;
  lineDataSymbol?: string;
  lineDataSymbolSize?: number;
  fill?: string;
  catAxisTitle?: string;
  valAxisTitle?: string;
  showValAxisTitle?: boolean;
  showCatAxisTitle?: boolean;
  showTitle?: boolean;
  valAxisMaxVal?: number;
  valAxisMinVal?: number;
  valAxisDisplayUnit?: string;
  catAxisOrientation?: string;
  valAxisOrientation?: string;
  catAxisLabelRotate?: number;
  valAxisLabelRotate?: number;
  secondaryValAxis?: boolean;
  secondaryCatAxis?: boolean;
  invertedColors?: boolean;
  holeSize?: number;
}
```

## Built-in Plugins

All core plugins are exported and can be used individually:

```typescript
import {
  textPlugin,
  shapePlugin,
  imagePlugin,
  tablePlugin,
  linePlugin,
  plotlyPlugin,
  fontAwesomePlugin,
} from "html-in-pptx-out";
```

## Constants

```typescript
import { DEFAULTS, DEFAULT_CORE_PLUGINS } from "html-in-pptx-out";

DEFAULTS.SLIDE_SELECTOR; // ".slide"
DEFAULTS.SLIDE_WIDTH;    // 992
DEFAULTS.SLIDE_HEIGHT;   // 558

DEFAULT_CORE_PLUGINS;    // Array of all core plugins
```
