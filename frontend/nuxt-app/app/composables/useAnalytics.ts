import { getAnalyticsPage } from "~/services/analytics.service";
import type { AnalyticsPageConfig } from "~/types/analytics";

export const useAnalytics = (pageKey: string) => {
  const data = ref<AnalyticsPageConfig | null>(null);
  const isLoading = ref(true);
  const error = ref("");

  const refresh = async () => {
    isLoading.value = true;
    error.value = "";

    try {
      data.value = await getAnalyticsPage(pageKey);

      if (!data.value) {
        error.value = "Analytics page configuration was not found.";
      }
    } catch {
      error.value = "Unable to load analytics data.";
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(refresh);

  return { data, error, isLoading, refresh };
};
