import type { CsvColumn, CsvValue } from "~/utils/exportCsv";
import { exportRowsToCsv } from "~/utils/exportCsv";

type CsvExportOptions<TRow extends Record<string, CsvValue>> = {
  filename: string;
  columns: CsvColumn<TRow>[];
  rows: TRow[];
  label?: string;
};

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    if (!import.meta.client) {
      resolve();
      return;
    }

    requestAnimationFrame(() => resolve());
  });

const wait = (duration: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });

export const useCsvExport = () => {
  const toast = useToast();

  const exportWithToast = async <TRow extends Record<string, CsvValue>>({
    filename,
    columns,
    rows,
    label = "CSV file",
  }: CsvExportOptions<TRow>) => {
    if (!rows.length) {
      toast.add({
        title: "No data to export",
        description: "Try changing the filters, then export again.",
        icon: "i-lucide-circle-alert",
        color: "warning",
      });
      return;
    }

    toast.add({
      title: "Preparing CSV",
      description: `${label} is being generated...`,
      icon: "i-lucide-loader-circle",
      color: "primary",
      duration: 1200,
    });

    await Promise.all([waitForPaint(), wait(650)]);

    try {
      exportRowsToCsv(filename, columns, rows);
      toast.add({
        title: "CSV ready",
        description: `${label} download has started.`,
        icon: "i-lucide-check-circle-2",
        color: "success",
      });
    } catch {
      toast.add({
        title: "Export failed",
        description: "The CSV file could not be generated. Please try again.",
        icon: "i-lucide-circle-x",
        color: "error",
      });
    }
  };

  return {
    exportWithToast,
  };
};
