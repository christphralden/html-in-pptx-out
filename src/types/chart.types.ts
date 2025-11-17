export type SourceLibrary = "plotly" | "echarts" | "chartjs" | "unknown";

export interface ExtractedChart {
  chartId: string;
  chartType: string;
  config: unknown;
  sourceLibrary: SourceLibrary;
}

export interface ChartSeries {
  name: string;
  values: number[];
  color?: string;
  colors?: string[];
  yAxis?: "y" | "y2" | "y3";
  chartType?: string;
}

export interface ChartOptions {
  title?: string;
  titleFontSize?: number;
  showLegend?: boolean;
  showDataLabels?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  yAxis2Title?: string;
  hasSecondaryAxis?: boolean;
  orientation?: "vertical" | "horizontal";
  hole?: number;
  is3D?: boolean;
  barGrouping?: "stacked" | "clustered" | "percentStacked";
  barmode?: "group" | "stack" | "relative";
  dataLabelFormat?: string;
  dataLabelPosition?: string;
  font?: { family?: string; size?: number };
  margin?: { t?: number; b?: number; l?: number; r?: number };
}

export interface ChartData {
  chartType: string;
  series: ChartSeries[];
  labels: string[];
  options?: ChartOptions;
}
