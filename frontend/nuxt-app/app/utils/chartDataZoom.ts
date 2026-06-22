import type { EChartsOption } from "echarts";
import { appColors, withAlpha } from "~/constants/colors";

export const createSimpleColumnScroll = (
  totalItems: number,
  visibleItems = 12,
): EChartsOption["dataZoom"] => {
  if (totalItems <= visibleItems) return undefined;

  const end = Math.min(100, (visibleItems / totalItems) * 100);

  return [
    {
      type: "inside",
      xAxisIndex: 0,
      start: 0,
      end,
      zoomLock: true,
      zoomOnMouseWheel: false,
      moveOnMouseMove: true,
      moveOnMouseWheel: true,
    },
    {
      type: "slider",
      xAxisIndex: 0,
      start: 0,
      end,
      height: 8,
      bottom: 18,
      zoomLock: true,
      brushSelect: false,
      showDataShadow: false,
      showDetail: false,
      handleSize: 0,
      moveHandleSize: 0,
      borderColor: "transparent",
      backgroundColor: withAlpha(appColors.muted, 0.18),
      fillerColor: appColors.blue,
    },
  ];
};
