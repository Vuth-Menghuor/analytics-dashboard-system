import { learningPerformancePreview } from "~/constants/learningPerformance";

export const useLearningPerformancePage = () => {
  const auth = useAuthStore();
  const preview = learningPerformancePreview;
  const partnerInstituteLabel = computed(() =>
    auth.user?.role === "partner" && auth.user.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "",
  );

  const riskCounts = computed(() => {
    const counts = {
      low: 0,
      medium: 0,
      high: 0,
    };

    preview.riskStudents.forEach((student) => {
      if (student.riskLevel === "Low") counts.low += 1;
      if (student.riskLevel === "Medium") counts.medium += 1;
      if (student.riskLevel === "High") counts.high += 1;
    });

    return counts;
  });

  return {
    charts: preview.charts,
    metrics: preview.metrics,
    partnerInstituteLabel,
    previewSummary: preview.previewSummary,
    riskCounts,
    riskRules: preview.riskRules,
    riskTable: preview.riskTable,
  };
};
