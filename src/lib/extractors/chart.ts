import type {
  ExtractedChart,
  SourceLibrary,
  ChartData,
  ChartSeries,
  ChartOptions,
} from "@/types/plotly.types";
import { CHART_TYPE_MAP } from "@/constants";

export const detectSourceLibrary = (config: unknown): SourceLibrary => {
  if (!config || typeof config !== "object") {
    return "unknown";
  }

  const configObj = config as Record<string, unknown>;

  const hasStandardPlotly = Boolean(
    Array.isArray(configObj.data) &&
      configObj.data.length > 0 &&
      configObj.data[0] &&
      typeof configObj.data[0] === "object" &&
      "type" in (configObj.data[0] as object),
  );

  if (hasStandardPlotly) {
    return "plotly";
  }

  const hasEChartsStructure = Boolean(configObj.series && configObj.xAxis);

  if (hasEChartsStructure) {
    return "echarts";
  }

  return "unknown";
};

export const extractChartsFromHTML = (
  doc: Document,
): Map<string, ExtractedChart> => {
  const charts = new Map<string, ExtractedChart>();

  const chartScripts = doc.querySelectorAll(
    'script[type="application/json"][data-chart-id]',
  );

  chartScripts.forEach((script) => {
    const chartId = script.getAttribute("data-chart-id");
    const chartType = script.getAttribute("data-chart-type");

    if (!chartId || !chartType) {
      return;
    }

    const chartDiv = doc.getElementById(chartId);
    if (!chartDiv) {
      return;
    }

    try {
      const config = JSON.parse(script.textContent || "{}");

      const configObj = config as Record<string, unknown>;
      const hasStandardPlotly = Boolean(
        Array.isArray(configObj.data) &&
          configObj.data.length > 0 &&
          configObj.data[0] &&
          typeof configObj.data[0] === "object" &&
          "type" in (configObj.data[0] as object),
      );

      if (!hasStandardPlotly) {
        return;
      }

      const sourceLibrary = detectSourceLibrary(config);
      const detectedChartType = (configObj.data as Array<{ type?: string }>)[0]
        .type as string;

      charts.set(chartId, {
        chartId,
        chartType: detectedChartType || chartType,
        config,
        sourceLibrary,
      });
    } catch {
      return;
    }
  });

  return charts;
};

const parseLabels = (labels: unknown[]): string[] => {
  if (!Array.isArray(labels)) return [];
  return labels.map((label) => {
    if (label === null || label === undefined) return "";
    return String(label);
  });
};

const parseValues = (values: unknown[]): number[] => {
  if (!Array.isArray(values)) return [];
  return values.map((value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  });
};

interface PlotlyTrace {
  type?: string;
  name?: string;
  x?: unknown[];
  y?: unknown[];
  labels?: unknown[];
  values?: unknown[];
  orientation?: string;
  yaxis?: string;
  text?: unknown[];
  textinfo?: string;
  textposition?: string;
  hole?: number;
  marker?: {
    color?: string | string[];
    colors?: string[];
  };
  line?: {
    color?: string;
  };
}

interface PlotlyLayout {
  title?: string | { text?: string; font?: { size?: number } };
  showlegend?: boolean;
  barmode?: string;
  xaxis?: { title?: string | { text?: string } };
  yaxis?: { title?: string | { text?: string } };
  yaxis2?: { title?: string | { text?: string } };
  font?: { family?: string; size?: number };
  margin?: { t?: number; b?: number; l?: number; r?: number };
}

interface PlotlyConfig {
  data: PlotlyTrace[];
  layout?: PlotlyLayout;
}

const extractLabelsFromTraces = (traces: PlotlyTrace[]): string[] => {
  for (const trace of traces) {
    if (trace.labels && Array.isArray(trace.labels)) {
      return parseLabels(trace.labels);
    }

    if (trace.orientation === "h" && trace.y && Array.isArray(trace.y)) {
      return parseLabels(trace.y);
    }

    if (trace.x && Array.isArray(trace.x)) {
      return parseLabels(trace.x);
    }
  }
  return [];
};

const extractColor = (trace: PlotlyTrace): string | undefined => {
  if (trace.marker?.color && typeof trace.marker.color === "string") {
    return trace.marker.color;
  }

  if (trace.line?.color && typeof trace.line.color === "string") {
    return trace.line.color;
  }

  return undefined;
};

const extractColors = (trace: PlotlyTrace): string[] | undefined => {
  if (trace.marker?.colors && Array.isArray(trace.marker.colors)) {
    return trace.marker.colors;
  }

  if (trace.marker?.color && Array.isArray(trace.marker.color)) {
    return trace.marker.color;
  }

  return undefined;
};

const extractTitle = (layout: PlotlyLayout): string | undefined => {
  if (!layout.title) return undefined;

  if (typeof layout.title === "string") {
    return layout.title;
  }

  if (typeof layout.title === "object" && layout.title.text) {
    return layout.title.text;
  }

  return undefined;
};

const extractTitleFontSize = (layout: PlotlyLayout): number | undefined => {
  if (!layout.title) return undefined;

  if (typeof layout.title === "string") {
    return 11;
  }

  if (typeof layout.title === "object" && layout.title.font) {
    return layout.title.font.size;
  }

  return undefined;
};

const extractAxisTitle = (
  axis: PlotlyLayout["xaxis"],
): string | undefined => {
  if (!axis || !axis.title) return undefined;

  if (typeof axis.title === "string") {
    return axis.title;
  }

  if (typeof axis.title === "object" && axis.title.text) {
    return axis.title.text;
  }

  return undefined;
};

export const transformPlotlyToChartData = (
  config: PlotlyConfig,
): ChartData => {
  const traces = config.data || [];
  const layout = config.layout || {};

  if (traces.length === 0) {
    throw new Error("No traces found in config.data");
  }

  const firstTrace = traces[0];
  const plotlyType = firstTrace?.type || "bar";
  const chartType = CHART_TYPE_MAP[plotlyType.toLowerCase()] || "bar";

  const labels = extractLabelsFromTraces(traces);

  const series: ChartSeries[] = traces.map((trace) => {
    const seriesData: ChartSeries = {
      name: trace.name || "Series",
      values: [],
      color: extractColor(trace),
      colors: extractColors(trace),
    };

    const traceType = trace.type || "bar";
    seriesData.chartType = CHART_TYPE_MAP[traceType.toLowerCase()] || traceType;

    if (trace.values) {
      seriesData.values = parseValues(trace.values);
    } else if (trace.orientation === "h" && trace.x) {
      seriesData.values = parseValues(trace.x);
    } else if (trace.y) {
      seriesData.values = parseValues(trace.y);
    }

    if (trace.yaxis === "y2") {
      seriesData.yAxis = "y2";
    } else if (trace.yaxis === "y3") {
      seriesData.yAxis = "y3";
    }

    return seriesData;
  });

  const options: ChartOptions = {
    title: extractTitle(layout),
    titleFontSize: extractTitleFontSize(layout),
    showLegend: layout.showlegend !== false,
    xAxisTitle: extractAxisTitle(layout.xaxis),
    yAxisTitle: extractAxisTitle(layout.yaxis),
    margin: layout.margin,
  };

  if (layout.yaxis2) {
    options.hasSecondaryAxis = true;
    options.yAxis2Title = extractAxisTitle(layout.yaxis2);
  }

  const hasTextLabels = traces.some(
    (trace) => trace.text && Array.isArray(trace.text) && trace.text.length > 0,
  );
  if (hasTextLabels || firstTrace.textinfo) {
    options.showDataLabels = true;
  }

  if (chartType === "bar") {
    options.orientation =
      firstTrace.orientation === "h" ? "horizontal" : "vertical";

    if (layout.barmode === "stack") {
      options.barGrouping = "stacked";
      options.barmode = "stack";
    } else if (layout.barmode === "group") {
      options.barGrouping = "clustered";
      options.barmode = "group";
    } else if (layout.barmode === "relative") {
      options.barGrouping = "percentStacked";
      options.barmode = "relative";
    }

    if (firstTrace.textposition) {
      options.dataLabelPosition = firstTrace.textposition;
    }
  }

  if (chartType === "pie") {
    if (firstTrace.hole !== undefined) {
      options.hole = firstTrace.hole;
    }

    if (firstTrace.textinfo) {
      options.dataLabelFormat = firstTrace.textinfo;
    }

    if (firstTrace.textposition) {
      options.dataLabelPosition = firstTrace.textposition;
    }
  }

  if (layout.font) {
    options.font = {
      family: layout.font.family,
      size: layout.font.size,
    };
  }

  return {
    chartType,
    series,
    labels,
    options,
  };
};
