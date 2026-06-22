const EMPTY_FIELD_VALUE = "Not filled";

export const emptyDepartmentLabel = "N/A";

export const formatStudentDepartmentLabel = (
  department: string | null | undefined,
) => {
  const normalizedDepartment = department?.trim() ?? "";

  return normalizedDepartment === "" || normalizedDepartment === EMPTY_FIELD_VALUE
    ? emptyDepartmentLabel
    : normalizedDepartment;
};
