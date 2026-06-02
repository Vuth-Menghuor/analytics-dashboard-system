type ReportExportKey =
  | "dashboard"
  | "students"
  | "courses"
  | "activity"
  | "learning";

type ReportCard = {
  key: ReportExportKey;
  title: string;
  description: string;
  icon: string;
  route: string;
  format: string;
};

const reportCards: Array<{
  key: ReportExportKey;
  title: string;
  description: string;
  icon: string;
  route: string;
  format: string;
}> = [
  {
    key: "dashboard",
    title: "Dashboard Report",
    description: "KPI cards and dashboard summary charts.",
    icon: "i-lucide-layout-dashboard",
    route: "/dashboard",
    format: "CSV first",
  },
  {
    key: "students",
    title: "Students Report",
    description: "Student list, filters, profile fields, and distributions.",
    icon: "i-lucide-users",
    route: "/students",
    format: "CSV first",
  },
  {
    key: "courses",
    title: "Courses Report",
    description: "Courses, completions, views, and visibility status.",
    icon: "i-lucide-book-open",
    route: "/courses",
    format: "CSV first",
  },
  {
    key: "activity",
    title: "User Activity Report",
    description: "Login status counts and activity breakdown.",
    icon: "i-lucide-activity",
    route: "/activity",
    format: "CSV first",
  },
  {
    key: "learning",
    title: "Learning Performance Report",
    description: "Grades, quizzes, assignments, and risk preview.",
    icon: "i-lucide-graduation-cap",
    route: "/learning-performance",
    format: "CSV later",
  },
];

export const useReportsPage = () => {
  const toast = useToast();
  const auth = useAuthStore();

  const partnerInstituteLabel = computed(() =>
    auth.user?.role === "partner" && auth.user.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "",
  );

  const previewExport = (report: ReportExportKey) => {
    const card = reportCards.find((item) => item.key === report);

    toast.add({
      title: "Export UI only",
      description: `${card?.title ?? "Report export"} will connect to the backend CSV export API later.`,
      color: "warning",
    });
  };

  const reportSummaryItems = computed(() => [
    {
      label: "Export format",
      value: "CSV",
      detail: "PDF can be added after API approval.",
    },
    {
      label: "Data scope",
      value: partnerInstituteLabel.value || "Role based",
      detail: partnerInstituteLabel.value
        ? "Partner exports will use approved institute scope."
        : "Manager exports can use global analytics scope.",
    },
    {
      label: "Status",
      value: "UI only",
      detail: "No backend export endpoint is called yet.",
    },
  ]);

  return {
    partnerInstituteLabel,
    previewExport,
    reportSummaryItems,
    reportCards,
  };
};
