type ReportExportKey =
  | "dashboard"
  | "students"
  | "courses"
  | "learningActivity";

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
    route: "/",
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
    key: "learningActivity",
    title: "Learning Activity Report",
    description: "Learner login recency and engagement-status breakdown.",
    icon: "i-lucide-activity",
    route: "/learning-activity",
    format: "CSV first",
  },
];

export const useReportsPage = () => {
  const auth = useAuthStore();

  const partnerInstituteLabel = computed(() =>
    auth.user?.role === "partner" && auth.user.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "",
  );

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
      value: "Available",
      detail: "CSV export buttons are available inside the feature pages.",
    },
  ]);

  return {
    partnerInstituteLabel,
    reportSummaryItems,
    reportCards,
  };
};
