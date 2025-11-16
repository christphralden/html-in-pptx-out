import type { ChartElementDTO } from "@/types/elements.types";
import type { Dimensions } from "@/types/base.types";
import type PptxGenJS from "pptxgenjs";
import { positionToPercentage, dimensionsToPercentage } from "../utils/units";

const CHART_TYPE_MAP: Record<string, string> = {
  bar: "bar",
  line: "line",
  pie: "pie",
  doughnut: "doughnut",
  area: "area",
  scatter: "scatter",
  radar: "radar",
  bubble: "bubble",
};

export const serializeChart = (
  slide: PptxGenJS.Slide,
  element: ChartElementDTO,
  viewport: Dimensions,
): void => {
  const pos = positionToPercentage(element.position, viewport);
  const dims = dimensionsToPercentage(element.dimensions, viewport);

  const chartType = CHART_TYPE_MAP[element.data.chartType] || "bar";

  const chartData: PptxGenJS.OptsChartData[] = element.data.series.map((series) => ({
    name: series.name,
    labels: element.data.labels,
    values: series.values,
  }));

  const chartOptions: PptxGenJS.IChartOpts = {
    x: pos.x,
    y: pos.y,
    w: dims.w,
    h: dims.h,
  };

  if (element.data.options) {
    const opts = element.data.options;

    if (opts.title) {
      chartOptions.title = opts.title;
      chartOptions.showTitle = true;
    }

    if (opts.showLegend !== undefined) {
      chartOptions.showLegend = opts.showLegend;
    }

    if (opts.showDataLabels !== undefined) {
      chartOptions.showLabel = opts.showDataLabels;
    }

    if (opts.xAxisTitle) {
      chartOptions.catAxisTitle = opts.xAxisTitle;
    }

    if (opts.yAxisTitle) {
      chartOptions.valAxisTitle = opts.yAxisTitle;
    }

    if (opts.orientation === "horizontal") {
      chartOptions.barDir = "bar";
    } else if (opts.orientation === "vertical") {
      chartOptions.barDir = "col";
    }

    if (opts.stacking === "stacked") {
      chartOptions.barGrouping = "stacked";
    } else if (opts.stacking === "percentStacked") {
      chartOptions.barGrouping = "percentStacked";
    }

    if (opts.hole !== undefined && chartType === "doughnut") {
      chartOptions.holeSize = opts.hole;
    }
  }

  slide.addChart(chartType as PptxGenJS.CHART_NAME, chartData, chartOptions);
};
