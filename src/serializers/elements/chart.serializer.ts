import type { ChartElementDTO, ChartSeries } from "@/types/elements.types";
import { positionToInches, dimensionsToInches } from "@/utils/units";
import { PPTX_CHART_TYPE_MAP } from "@/constants";
import PptxGenJS from "pptxgenjs";
import { sanitizeColor } from "@/utils/sanitize";

const detectDecimalFormat = (
  series: ChartElementDTO["data"]["series"],
): string => {
  for (const s of series) {
    if (!s.values || !Array.isArray(s.values)) continue;

    for (const value of s.values) {
      if (typeof value === "number" && !Number.isInteger(value)) {
        let maxDecimals = 0;
        for (const v of s.values) {
          if (typeof v === "number" && !Number.isInteger(v)) {
            const decimals = v.toString().split(".")[1]?.length || 0;
            maxDecimals = Math.max(maxDecimals, Math.min(decimals, 2));
          }
        }

        if (maxDecimals === 1) return "#,##0.0";
        return "#,##0.00";
      }
    }
  }

  return "#,##0";
};

const mapChartTypeToPptxGenJS = (chartType: string): string => {
  return PPTX_CHART_TYPE_MAP[chartType] || "bar";
};

const getPptxChartTypeKey = (element: ChartElementDTO): string => {
  const chartType = element.data.chartType;

  if (
    chartType === "pie" &&
    element.data.options?.hole !== undefined &&
    element.data.options.hole > 0
  ) {
    return "doughnut";
  }

  return PPTX_CHART_TYPE_MAP[chartType] || "bar";
};

interface ComboChartType {
  typeKey: string;
  data: ChartSeries[];
  options: Record<string, unknown>;
}

interface TransformedChartData {
  data: ChartSeries[] | null;
  options: Record<string, unknown>;
  chartTypesForCombo?: ComboChartType[];
  chartTypeKey: string;
}

export const transformChartToPptxGenJS = (
  element: ChartElementDTO,
): TransformedChartData => {
  const pos = positionToInches(element.position);
  const dims = dimensionsToInches(element.dimensions);

  const chartData = element.data;
  const normalized = {
    type: chartData.chartType,
    series: chartData.series,
    labels: chartData.labels,
    options: chartData.options,
  };

  const data: ChartSeries[] = normalized.series.map((series) => ({
    name: series.name,
    labels: normalized.labels,
    values: series.values,
    color: sanitizeColor(series.color || ""),
  }));

  const options: Record<string, unknown> = {
    x: pos.x,
    y: pos.y,
    w: dims.w,
    h: dims.h,
    title: normalized.options?.title,
    showTitle: normalized.options?.title ? true : false,
    titleFontSize: normalized.options?.titleFontSize || 11,
    showLegend: normalized.options?.showLegend !== false,
    legendPos: "t",
    legendFontSize: 11,
    showLabel: normalized.options?.showDataLabels === true,
  };

  const showDataLabels = normalized.options?.showDataLabels === true;

  if (showDataLabels) {
    if (normalized.type === "bar") {
      options.showValue = true;
      const formatCode = detectDecimalFormat(normalized.series);
      if (formatCode) {
        options.dataLabelFormatCode = formatCode;
      }
    } else if (normalized.type === "pie") {
      options.showPercent = true;
    }
  }

  if (normalized.type === "pie") {
    options.dataLabelPosition = "outEnd";
  }

  const allColors: string[] = [];

  const hasColorsArray = normalized.series.some(
    (s) => s.colors && s.colors.length > 0,
  );

  if (hasColorsArray) {
    const seriesWithColors = normalized.series.find(
      (s) => s.colors && s.colors.length > 0,
    );
    if (seriesWithColors?.colors) {
      allColors.push(...seriesWithColors.colors);
    }
  } else {
    normalized.series.forEach((series) => {
      if (series.color) {
        allColors.push(series.color);
      }
    });
  }

  if (allColors.length > 0) {
    options.chartColors = allColors
      .map((c) => sanitizeColor(c))
      .filter((c): c is string => c !== undefined);
  }

  if (normalized.options?.xAxisTitle) {
    options.catAxisTitle = normalized.options.xAxisTitle;
    options.showCatAxisTitle = true;
    options.catAxisTitleFontSize = 11;
  }
  if (normalized.options?.yAxisTitle) {
    options.valAxisTitle = normalized.options.yAxisTitle;
    options.showValAxisTitle = true;
    options.valAxisTitleFontSize = 11;
  }

  options.catAxisLabelFontSize = 11;
  options.valAxisLabelFontSize = 11;

  options.catGridLine = { style: "none" };
  options.valGridLine = { style: "solid", size: 1, color: "D9D9D9" };

  if (normalized.options?.hole !== undefined && normalized.options.hole > 0) {
    options.holeSize = Math.round(normalized.options.hole * 100);
  }

  if (normalized.options?.orientation === "horizontal") {
    options.barDir = "bar";
  } else if (
    normalized.options?.orientation === "vertical" ||
    normalized.type === "bar"
  ) {
    options.barDir = "col";
  }

  if (normalized.options?.barGrouping) {
    options.barGrouping = normalized.options.barGrouping;
  }

  if (normalized.options?.hasSecondaryAxis) {
    const primaryAxisSeriesMap = new Map<string, ChartSeries[]>();
    const secondaryAxisSeriesMap = new Map<string, ChartSeries[]>();

    normalized.series.forEach((series, idx) => {
      const seriesChartType = series.chartType || normalized.type;
      const seriesData = data[idx];

      if (series.yAxis === "y2") {
        if (!secondaryAxisSeriesMap.has(seriesChartType)) {
          secondaryAxisSeriesMap.set(seriesChartType, []);
        }
        secondaryAxisSeriesMap.get(seriesChartType)!.push(seriesData);
      } else {
        if (!primaryAxisSeriesMap.has(seriesChartType)) {
          primaryAxisSeriesMap.set(seriesChartType, []);
        }
        primaryAxisSeriesMap.get(seriesChartType)!.push(seriesData);
      }
    });

    if (secondaryAxisSeriesMap.size === 0) {
      return { data, options, chartTypeKey: getPptxChartTypeKey(element) };
    }

    const chartTypesForCombo: ComboChartType[] = [];

    primaryAxisSeriesMap.forEach((seriesDataArray, seriesChartType) => {
      chartTypesForCombo.push({
        typeKey: mapChartTypeToPptxGenJS(seriesChartType),
        data: seriesDataArray,
        options: {},
      });
    });

    secondaryAxisSeriesMap.forEach((seriesDataArray, seriesChartType) => {
      const isLineChart =
        seriesChartType === "line" || seriesChartType === "area";
      chartTypesForCombo.push({
        typeKey: mapChartTypeToPptxGenJS(seriesChartType),
        data: seriesDataArray,
        options: {
          secondaryValAxis: true,
          secondaryCatAxis: true,
          ...(isLineChart ? { showValue: true, dataLabelPosition: "t" } : {}),
        },
      });
    });

    const globalOptions: Record<string, unknown> = {
      x: options.x,
      y: options.y,
      w: options.w,
      h: options.h,
      title: options.title,
      showTitle: options.showTitle,
      titleFontSize: options.titleFontSize,
      showLegend: options.showLegend,
      legendPos: "t",
      legendFontSize: 11,
      chartColors: options.chartColors,
      dataLabelFormatCode: options.dataLabelFormatCode,
      valAxes: [
        {
          valAxisTitle: normalized.options.yAxisTitle || "",
          showValAxisTitle: normalized.options.yAxisTitle ? true : false,
          valAxisTitleFontSize: 11,
          valAxisLabelFontSize: 11,
          valGridLine: { style: "solid", size: 1, color: "D9D9D9" },
        },
        {
          valAxisTitle: normalized.options.yAxis2Title || "",
          showValAxisTitle: false,
          valAxisTitleFontSize: 11,
          valAxisLabelFontSize: 11,
          valGridLine: { style: "none" },
        },
      ],
      catAxes: [
        {
          catAxisTitle: normalized.options.xAxisTitle || "",
          showCatAxisTitle: normalized.options.xAxisTitle ? true : false,
          catAxisTitleFontSize: 11,
          catAxisLabelFontSize: 11,
          catGridLine: { style: "none" },
        },
        {
          catAxisLabelFontSize: 11,
          catAxisHidden: true,
          catGridLine: { style: "none" },
        },
      ],
    };

    return {
      data: null,
      options: globalOptions,
      chartTypesForCombo,
      chartTypeKey: getPptxChartTypeKey(element),
    };
  }

  return { data, options, chartTypeKey: getPptxChartTypeKey(element) };
};

export const serializeChart = (
  slide: PptxGenJS.Slide,
  element: ChartElementDTO,
): void => {
  const { data, options, chartTypesForCombo, chartTypeKey } =
    transformChartToPptxGenJS(element);

  if (element.data.options?.hasSecondaryAxis && chartTypesForCombo) {
    const comboChartTypes = chartTypesForCombo.map((chartTypeInfo) => ({
      type: chartTypeInfo.typeKey,
      data: chartTypeInfo.data,
      options: chartTypeInfo.options || {},
    }));

    slide.addChart(comboChartTypes as any, options as any);
  } else {
    const chartType = chartTypeKey;

    if (!chartType || !data) {
      return;
    }

    slide.addChart(chartType as any, data as any, options as any);
  }
};
