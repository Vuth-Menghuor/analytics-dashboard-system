export type CsvValue = string | number | boolean | null | undefined;

export type CsvColumn<TRow extends Record<string, CsvValue>> = {
  key: keyof TRow;
  label: string;
};

const escapeCsvValue = (value: CsvValue) => {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
};

export const exportRowsToCsv = <TRow extends Record<string, CsvValue>>(
  filename: string,
  columns: CsvColumn<TRow>[],
  rows: TRow[],
) => {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column.key])).join(","),
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
