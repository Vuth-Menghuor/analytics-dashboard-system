export type CsvValue = string | number | boolean | null | undefined;
export type ExportFormat = "csv" | "excel";

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

const escapeHtmlValue = (value: CsvValue) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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

  downloadBlob(filename, blob);
};

export const exportRowsToExcel = <TRow extends Record<string, CsvValue>>(
  filename: string,
  columns: CsvColumn<TRow>[],
  rows: TRow[],
) => {
  const header = columns
    .map((column) => `<th>${escapeHtmlValue(column.label)}</th>`)
    .join("");
  const body = rows
    .map((row) => {
      const cells = columns
        .map((column) => `<td>${escapeHtmlValue(row[column.key])}</td>`)
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");
  const workbook = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    table { border-collapse: collapse; }
    th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
    th { font-weight: 700; background: #f3f4f6; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${header}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>`;
  const blob = new Blob([workbook], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  downloadBlob(filename, blob);
};
