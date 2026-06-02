import type { EChartsOption } from "echarts";
import { appColors } from "~/constants/colors";
import { learningPerformancePreview } from "~/constants/learningPerformance";
import {
  getPopularCourses,
  getCourseCompletion,
  getStudentActivity,
  getStudentGenderDistribution,
  getStudentsByDepartment,
} from "~/services/analytics.service";
import type {
  CourseCompletionApi,
  PopularCourseApi,
  StudentActivityApi,
  StudentDepartmentDistributionApi,
  StudentGenderDistributionApi,
} from "~/types/analytics-api";

const getCourseDisplayName = (courseName: string): string => {
  const parts = courseName.trim().split(" ");

  if (parts.length <= 1) {
    return courseName;
  }

  return parts.slice(1).join(" ");
};

const assignIfLoaded = <T>(
  result: PromiseSettledResult<T>,
  assign: (data: T) => void,
) => {
  if (result.status !== "fulfilled") {
    return false;
  }

  assign(result.value);
  return true;
};

export const useManagerDashboardPage = () => {
  const {
    data: moodleDashboard,
    error: moodleDashboardError,
    isLoading: moodleDashboardLoading,
  } = useDashboard();

  const genderDistribution = ref<StudentGenderDistributionApi[]>([]);
  const departmentDistribution = ref<StudentDepartmentDistributionApi[]>([]);
  const popularCourses = ref<PopularCourseApi[]>([]);
  const completionCourses = ref<CourseCompletionApi[]>([]);
  const studentActivity = ref<StudentActivityApi[]>([]);
  const chartError = ref("");
  const chartsLoading = ref(true);

  const loadCharts = async () => {
    chartsLoading.value = true;
    chartError.value = "";

    const results = await Promise.allSettled([
      getStudentGenderDistribution(),
      getStudentsByDepartment(),
      getPopularCourses(),
      getCourseCompletion(),
      getStudentActivity(),
    ]);

    const loadedCount = [
      assignIfLoaded(results[0], (data) => {
        genderDistribution.value = data;
      }),
      assignIfLoaded(results[1], (data) => {
        departmentDistribution.value = data;
      }),
      assignIfLoaded(results[2], (data) => {
        popularCourses.value = data;
      }),
      assignIfLoaded(results[3], (data) => {
        completionCourses.value = data;
      }),
      assignIfLoaded(results[4], (data) => {
        studentActivity.value = data;
      }),
    ].filter(Boolean).length;

    if (loadedCount === 0) {
      chartError.value = "Unable to load live dashboard charts.";
    }

    chartsLoading.value = false;
  };

  onMounted(loadCharts);

  const metrics = computed(() => moodleDashboard.value?.metrics ?? []);

  const genderChartData = computed(() =>
    genderDistribution.value.map((point) => ({
      name: point.gender,
      value: point.totalStudents,
    })),
  );

  const departmentChartData = computed(() =>
    departmentDistribution.value.map((point) => ({
      name: `${point.institution} / ${point.department}`,
      institution: point.institution,
      department: point.department,
      value: point.totalStudents,
      percentage: point.percentage,
    })),
  );

  const topDepartmentsOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { top: 16, right: 18, bottom: 24, left: 12, containLabel: true },
    xAxis: {
      type: "value",
      axisTick: { show: false },
      splitLine: { lineStyle: { color: appColors.grid } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: departmentChartData.value
        .slice(0, 10)
        .map((point) => point.department),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: appColors.secondary,
        width: 140,
        overflow: "truncate",
      },
    },
    series: [
      {
        name: "Students",
        type: "bar",
        barMaxWidth: 24,
        data: departmentChartData.value.slice(0, 10).map((point) => point.value),
        itemStyle: { borderRadius: [0, 6, 6, 0] },
      },
    ],
  }));

  const studentActivityChartData = computed(() =>
    studentActivity.value.map((point) => ({
      name: point.loginStatus,
      value: point.totalStudents,
    })),
  );

  const totalGenderStudents = computed(() =>
    genderChartData.value.reduce((total, point) => total + point.value, 0),
  );

  const genderDistributionOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover, appColors.purple, appColors.warning],
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
      itemWidth: 16,
      itemHeight: 10,
    },
    series: [
      {
        name: "Gender",
        type: "pie",
        radius: ["52%", "74%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        label: {
          formatter: "{b}\n{d}%",
          color: appColors.ink,
          fontWeight: 700,
        },
        data: genderChartData.value,
      },
    ],
  }));

  const studentActivityOption = computed<EChartsOption>(() => ({
    color: [
      appColors.primaryHover,
      appColors.purple,
      appColors.warning,
      appColors.success,
    ],
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
      itemWidth: 16,
      itemHeight: 10,
    },
    series: [
      {
        name: "Student login activity",
        type: "pie",
        radius: ["62%", "88%"],
        center: ["50%", "78%"],
        startAngle: 180,
        endAngle: 360,
        avoidLabelOverlap: true,
        label: {
          formatter: "{b}",
          color: appColors.ink,
        },
        data: studentActivityChartData.value,
      },
    ],
  }));

  const popularCoursesOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      top: 16,
      right: 18,
      bottom: 24,
      left: 12,
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: appColors.grid },
      },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: popularCourses.value.map((course) =>
        getCourseDisplayName(course.courseName),
      ),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: appColors.secondary,
        width: 120,
        overflow: "truncate",
      },
    },
    series: [
      {
        name: "Enrollments",
        type: "bar",
        barMaxWidth: 24,
        data: popularCourses.value.map((course) => course.totalEnrollments),
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
        },
      },
    ],
  }));

  const courseCompletionOption = computed<EChartsOption>(() => ({
    color: [appColors.success],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `${value}%`,
    },
    grid: {
      top: 16,
      right: 18,
      bottom: 24,
      left: 12,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: completionCourses.value.map((course) =>
        getCourseDisplayName(course.courseName),
      ),
      axisTick: { show: false },
      axisLabel: {
        color: appColors.secondary,
        width: 92,
        overflow: "truncate",
      },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisTick: { show: false },
      splitLine: { lineStyle: { color: appColors.grid } },
      axisLabel: { formatter: "{value}%", color: appColors.secondary },
    },
    series: [
      {
        name: "Completion rate",
        type: "bar",
        barMaxWidth: 24,
        data: completionCourses.value.map(
          (course) => course.completionRatePercentage,
        ),
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  }));

  const staticRiskPreviewOption = computed<EChartsOption>(() => {
    const riskChart = learningPerformancePreview.charts.find(
      (chart) => chart.title === "Student Risk Level",
    );

    return {
      color: [appColors.success, appColors.warning, "#dc2626"],
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
      series: [
        {
          name: "Risk level",
          type: "pie",
          radius: ["52%", "74%"],
          center: ["50%", "42%"],
          label: { formatter: "{b}\n{d}%", color: appColors.ink },
          data:
            riskChart?.labels.map((label, index) => ({
              name: label,
              value: riskChart.series[0]?.data[index] ?? 0,
            })) ?? [],
        },
      ],
    };
  });

  const learningPerformanceSummary = learningPerformancePreview.metrics.slice(
    0,
    3,
  );

  return {
    chartError,
    chartsLoading,
    topDepartmentsOption,
    popularCoursesOption,
    courseCompletionOption,
    genderDistributionOption,
    totalGenderStudents,
    studentActivityOption,
    learningPerformanceSummary,
    metrics,
    moodleDashboard,
    moodleDashboardError,
    moodleDashboardLoading,
    staticRiskPreviewOption,
  };
};
