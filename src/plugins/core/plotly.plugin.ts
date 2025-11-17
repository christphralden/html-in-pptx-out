import type { Plugin } from "@/types/plugin.types";
import type { ChartData, ExtractedChart } from "@/types/plotly.types";
import {
  extractChartsFromHTML,
  transformPlotlyToChartData,
} from "@/lib/extractors/plotly";
import { ChartElementDTO, ImageElementDTO } from "@/types/elements.types";

interface ChartBounds {
  left: number;
  top: number;
  width: number;
  height: number;
  slideIndex: number;
}

interface ChartPluginState {
  extractedCharts: Map<string, ExtractedChart>;
  chartBoundsMap: Map<string, ChartBounds>;
}

export const plotlyPlugin: Plugin = {
  name: "core:chart-plotly",
  handles: ["chart"],
  beforeParse: (html, _config, context) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const extractedCharts = extractChartsFromHTML(doc);

    if (extractedCharts.size === 0) {
      return html;
    }

    const state: ChartPluginState = {
      extractedCharts,
      chartBoundsMap: new Map(),
    };

    context.state.set(plotlyPlugin.name, state);

    return html;
  },

  onParse: (element, parseContext, pluginContext) => {
    const state = pluginContext.state.get(plotlyPlugin.name) as
      | ChartPluginState
      | undefined;

    if (!state || state.extractedCharts.size === 0) return null;

    const doc = element.ownerDocument;
    const { slideIndex, slideElement } = parseContext;
    const slideRect = slideElement.getBoundingClientRect();

    state.extractedCharts.forEach((_, chartId) => {
      if (state.chartBoundsMap.has(chartId)) return;

      const chartDiv = doc.getElementById(chartId);
      if (!chartDiv || !slideElement.contains(chartDiv)) return;

      const chartRect = chartDiv.getBoundingClientRect();
      state.chartBoundsMap.set(chartId, {
        left: chartRect.left - slideRect.left,
        top: chartRect.top - slideRect.top,
        width: chartRect.width,
        height: chartRect.height,
        slideIndex,
      });
    });

    return null;
  },

  onSlide: (slide, context) => {
    const state = context.state.get(plotlyPlugin.name) as
      | ChartPluginState
      | undefined;

    if (!state || state.extractedCharts.size === 0) {
      return slide;
    }

    if (state.chartBoundsMap.size === 0) {
      return slide;
    }

    const { extractedCharts, chartBoundsMap } = state;

    const indicesToRemove = new Set<number>();
    const chartElements: ChartElementDTO[] = [];

    extractedCharts.forEach((chartData, chartId) => {
      const chartBounds = chartBoundsMap.get(chartId);
      if (!chartBounds || chartBounds.slideIndex !== slide.order) return;

      let bestMatchIndex = -1;
      let bestDistance = Infinity;

      slide.elements.forEach((el, index) => {
        if (el.type !== "image") return;
        if (indicesToRemove.has(index)) return;

        const distance = Math.sqrt(
          Math.pow(el.position.left - chartBounds.left, 2) +
            Math.pow(el.position.top - chartBounds.top, 2),
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatchIndex = index;
        }
      });

      if (bestMatchIndex !== -1) {
        let chartDataDTO: ChartData;
        try {
          if (chartData.sourceLibrary === "plotly") {
            chartDataDTO = transformPlotlyToChartData(
              chartData.config as Parameters<
                typeof transformPlotlyToChartData
              >[0],
            );
          } else {
            return;
          }
        } catch {
          return;
        }

        const matchedImage = slide.elements[bestMatchIndex] as ImageElementDTO;
        const matchLeft = matchedImage.position.left;
        const matchTop = matchedImage.position.top;
        const matchRight = matchLeft + matchedImage.dimensions.width;
        const matchBottom = matchTop + matchedImage.dimensions.height;

        slide.elements.forEach((el, index) => {
          if (el.type !== "image") return;

          const img = el as ImageElementDTO;
          const imgLeft = img.position.left;
          const imgTop = img.position.top;
          const imgRight = imgLeft + img.dimensions.width;
          const imgBottom = imgTop + img.dimensions.height;

          const isOverlapping =
            imgLeft >= matchLeft &&
            imgTop >= matchTop &&
            imgRight <= matchRight &&
            imgBottom <= matchBottom;

          if (isOverlapping) {
            indicesToRemove.add(index);
          }
        });

        const chartElement: ChartElementDTO = {
          type: "chart",
          originalType: "image",
          id: crypto.randomUUID(),
          position: matchedImage.position,
          dimensions: matchedImage.dimensions,
          data: chartDataDTO,
          sourceLibrary: chartData.sourceLibrary,
        };

        chartElements.push(chartElement);
      }
    });

    // remove previous elements and will replace with chart element
    const filteredElements = slide.elements.filter(
      (_, index) => !indicesToRemove.has(index),
    );

    return {
      ...slide,
      elements: [...filteredElements, ...chartElements],
    };
  },
};
