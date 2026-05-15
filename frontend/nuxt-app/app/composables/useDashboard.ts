import { getDashboardSummary } from "~/services/analytics.service";

export const useDashboard = () => {
  const data = ref<Awaited<ReturnType<typeof getDashboardSummary>> | null>(null);
  const isLoading = ref(true);
  const error = ref("");

  const refresh = async () => {
    isLoading.value = true;
    error.value = "";

    try {
      data.value = await getDashboardSummary();
    } catch {
      error.value = "Unable to load dashboard summary.";
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(refresh);

  return { data, error, isLoading, refresh };
};
