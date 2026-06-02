import { appColors } from "~/constants/colors";
import {
  getDashboardSummaryData,
  getUserActivity,
} from "~/services/analytics.service";
import type { AnalyticsChart, AnalyticsTable } from "~/types/analytics";
import type {
  DashboardSummaryApi,
  UserActivityApi,
} from "~/types/analytics-api";
import type { Metric } from "~/types/dashboard";

export const useUserActivityPage = () => {
  const auth = useAuthStore();
  const activity = ref<UserActivityApi[]>([]);
  const summary = ref<DashboardSummaryApi | null>(null);
  const activityLoading = ref(true);
  const summaryLoading = ref(true);
  const activityError = ref("");
  const summaryError = ref("");
  const partnerInstituteLabel = computed(() =>
    auth.user?.role === "partner" && auth.user.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "",
  );

  const refresh = async () => {
    activityLoading.value = true;
    summaryLoading.value = true;
    activityError.value = "";
    summaryError.value = "";

    const [activityResult, summaryResult] = await Promise.allSettled([
      getUserActivity(),
      getDashboardSummaryData(),
    ]);

    if (activityResult.status === "fulfilled") {
      activity.value = activityResult.value;
    } else {
      activityError.value = "Unable to load user activity login status.";
    }

    if (summaryResult.status === "fulfilled") {
      summary.value = summaryResult.value;
    } else {
      summaryError.value = "Unable to load activity summary metrics.";
    }

    activityLoading.value = false;
    summaryLoading.value = false;
  };

  onMounted(refresh);

  const totalUsers = computed(() =>
    activity.value.reduce((sum, point) => sum + point.totalUsers, 0),
  );

  const neverLoggedIn = computed(
    () =>
      activity.value.find((point) => point.loginStatus === "Never logged in")
        ?.totalUsers ?? 0,
  );

  const metrics = computed<Metric[]>(() => [
    {
      label: "Active Users",
      value: (summary.value?.totalActiveUsers ?? 0).toLocaleString(),
      trend: "Confirmed and not suspended",
      icon: "UserRoundCheck",
      color: appColors.success,
    },
    {
      label: "Inactive Users",
      value: (summary.value?.totalInactiveUsers ?? 0).toLocaleString(),
      trend: "Suspended, unconfirmed, or no login",
      icon: "UserRoundX",
      color: appColors.warning,
    },
    {
      label: "Never Logged In",
      value: neverLoggedIn.value.toLocaleString(),
      trend: "No Moodle login recorded",
      icon: "UserCircle",
      color: appColors.purple,
    },
  ]);

  const charts = computed<AnalyticsChart[]>(() => [
    {
      title: "Login Status",
      description: "Share of Moodle users by last login bucket",
      icon: "i-lucide-pie-chart",
      type: "donut",
      labels: activity.value.map((point) => point.loginStatus),
      series: [
        {
          name: "Users",
          data: activity.value.map((point) => point.totalUsers),
        },
      ],
    },
    {
      title: "Login Status Count",
      description: "User counts by Moodle login recency",
      icon: "i-lucide-bar-chart-3",
      type: "bar",
      labels: activity.value.map((point) => point.loginStatus),
      series: [
        {
          name: "Users",
          data: activity.value.map((point) => point.totalUsers),
        },
      ],
    },
    {
      title: "Active vs Inactive Users",
      description: "Moodle active and inactive account status",
      icon: "i-lucide-user-round-check",
      type: "donut",
      labels: ["Active", "Inactive"],
      series: [
        {
          name: "Users",
          data: [
            summary.value?.totalActiveUsers ?? 0,
            summary.value?.totalInactiveUsers ?? 0,
          ],
        },
      ],
    },
  ]);

  const table = computed<AnalyticsTable>(() => ({
    title: "User Activity",
    icon: "i-lucide-activity",
    description: "Login status totals from the imported Moodle analytics data.",
    rowKey: "loginStatus",
    columns: [
      { key: "loginStatus", label: "Login status", rowHeader: true },
      { key: "totalUsers", label: "Total users", tone: "strong" },
      { key: "percentage", label: "Percentage" },
    ],
    rows: activity.value.map((point) => ({
      loginStatus: point.loginStatus,
      totalUsers: point.totalUsers.toLocaleString(),
      percentage: totalUsers.value
        ? `${((point.totalUsers * 100) / totalUsers.value).toFixed(1)}%`
        : "0%",
    })),
  }));

  return {
    activityError,
    activityLoading,
    charts,
    error: computed(() =>
      activityError.value && summaryError.value
        ? "Unable to load user activity analytics."
        : "",
    ),
    isLoading: computed(() => activityLoading.value && summaryLoading.value),
    metrics,
    partnerInstituteLabel,
    refresh,
    summaryError,
    summaryLoading,
    table,
  };
};
