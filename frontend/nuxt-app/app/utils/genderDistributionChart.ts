import type { EChartsOption } from "echarts";
import { appColors } from "~/constants/colors";
import type { StudentGenderDistributionApi } from "~/types/analytics-api";
import {
  formatStudentGenderLabel,
  getStudentGenderChartColor,
} from "~/utils/studentGender";

export const createGenderDistributionOption = (
  genderDistribution: StudentGenderDistributionApi[],
): EChartsOption => {
  const data = genderDistribution.map((point) => ({
    name: formatStudentGenderLabel(point.gender),
    value: point.totalStudents,
    itemStyle: { color: getStudentGenderChartColor(point.gender) },
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      top: 0,
      left: "center",
      data: data.map((point) => point.name),
    },
    series: [
      {
        name: "Gender",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "55%"],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: "outside",
          color: appColors.ink,
          formatter: "{b}: {c} ({d}%)",
        },
        emphasis: {
          scale: false,
          label: { show: true },
        },
        labelLine: {
          show: true,
          length: 12,
          length2: 8,
        },
        data,
      },
    ],
  };
};
