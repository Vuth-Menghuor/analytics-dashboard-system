import { chartColors } from "~/constants/colors";

export const getChartPointColor = (index: number) =>
  chartColors[index % chartColors.length] ?? "#0A3868";

export const formatChartValue = (value: unknown) => {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value ?? "").replace(/,/g, ""));

  return Number.isFinite(numericValue) ? numericValue.toLocaleString() : "0";
};

export const createColoredBarData = (
  values: Array<number | string>,
  borderRadius: number[],
) =>
  values.map((value, index) => ({
    value,
    itemStyle: {
      color: getChartPointColor(index),
      borderRadius,
    },
  }));
