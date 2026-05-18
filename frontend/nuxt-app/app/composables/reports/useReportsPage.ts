import {
  reportFilterOptions,
  savedReportColumns,
  savedReports,
} from "~/constants/reports";
import type { AnalyticsTable } from "~/types/analytics";

export const useReportsPage = () => {
  const filters = reactive({
    range: "Last 30 days",
    institute: "All institutes",
    course: "All courses",
    status: "All students",
  });

  const table = computed<AnalyticsTable>(() => ({
    title: "Saved Reports",
    icon: "i-lucide-file-bar-chart",
    description: "Prepared report packages for repeated Moodle database exports.",
    rowKey: "id",
    columns: savedReportColumns,
    rows: [...savedReports],
  }));

  return {
    filters,
    filterOptions: {
      ranges: [...reportFilterOptions.ranges],
      institutes: [...reportFilterOptions.institutes],
      courses: [...reportFilterOptions.courses],
      statuses: [...reportFilterOptions.statuses],
    },
    table,
  };
};
