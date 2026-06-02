import type { EChartsOption } from "echarts";
import { recentCourseColumns } from "~/constants/analytics";
import { appColors } from "~/constants/colors";
import { api } from "~/services/api";
import type { ImportedMetric, ImportedOverview, RecentCourse, TopCategory } from "~/types/analytics";

const tooltipShadow = "0 14px 34px rgba(15, 23, 42, 0.14)";

const formatCourseDate = (value: string | null) => {
  if (!value) {
    return "Unknown";
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

export const useAnalyticsOverview = () => {
  const importedMetrics = ref<ImportedMetric[]>([]);
  const topCategories = ref<TopCategory[]>([]);
  const recentCourses = ref<RecentCourse[]>([]);
  const isLoading = ref(true);
  const loadError = ref("");

  const categoryPeakCourses = computed(() =>
    Math.max(...topCategories.value.map((category) => category.coursecount), 0),
  );
  const categoryChartHeight = computed(() => `${topCategories.value.length * 40 + 42}px`);
  const recentCourseRows = computed(() =>
    recentCourses.value.map((course) => ({
      fullname: course.fullname,
      shortname: course.shortname,
      visible: course.visible,
      updated_at: formatCourseDate(course.updated_at),
    })),
  );

  const categoryOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        shadowStyle: { color: "rgba(6, 75, 130, 0.08)" },
      },
      backgroundColor: appColors.white,
      borderColor: appColors.axis,
      borderWidth: 1,
      borderRadius: 8,
      padding: [10, 12],
      textStyle: { color: appColors.ink, fontSize: 12 },
      extraCssText: `box-shadow: ${tooltipShadow};`,
    },
    grid: { top: 8, right: 52, bottom: 10, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      max: Math.ceil(categoryPeakCourses.value * 1.15),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: topCategories.value.map((category) => category.name),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#334155",
        fontSize: 12,
        fontWeight: 700,
        width: 238,
        overflow: "truncate",
      },
    },
    series: [
      {
        name: "Courses",
        type: "bar",
        data: topCategories.value.map((category) => category.coursecount),
        barMaxWidth: 16,
        barCategoryGap: "52%",
        showBackground: true,
        backgroundStyle: {
          color: "#f1f5f9",
          borderRadius: [0, 999, 999, 0],
        },
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: appColors.primaryHover },
              { offset: 1, color: appColors.success },
            ],
          },
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          color: "#0f172a",
          fontSize: 12,
          fontWeight: 800,
        },
        emphasis: {
          focus: "series",
        },
      },
    ],
  }));

  onMounted(async () => {
    try {
      const { data } = await api.get<ImportedOverview>("/analytics/imported/overview");

      importedMetrics.value = data.metrics;
      topCategories.value = data.top_categories;
      recentCourses.value = data.recent_courses;
    } catch {
      loadError.value = "Unable to load imported database analytics.";
    } finally {
      isLoading.value = false;
    }
  });

  return {
    categoryChartHeight,
    categoryOption,
    importedMetrics,
    isLoading,
    loadError,
    recentCourseColumns,
    recentCourseRows,
    topCategories,
  };
};
