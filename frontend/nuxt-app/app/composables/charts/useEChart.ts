import type { ECharts, EChartsOption } from "echarts";
import type { Ref } from "vue";

export const useEChart = (option: Ref<EChartsOption>) => {
  const chartEl = ref<HTMLElement | null>(null);
  let chart: ECharts | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function renderChart() {
    chart?.setOption(option.value, true);
  }

  onMounted(async () => {
    if (!chartEl.value) {
      return;
    }

    const echarts = await import("echarts");
    chart = echarts.init(chartEl.value, null, { renderer: "canvas" });
    renderChart();

    resizeObserver = new ResizeObserver(() => chart?.resize());
    resizeObserver.observe(chartEl.value);
  });

  watch(option, renderChart, { deep: true });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    chart?.dispose();
    chart = null;
  });

  return { chartEl };
};
