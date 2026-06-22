const EMPTY_FIELD_VALUE = "Not filled";

export const emptyInstituteLabel = "N/A";

export const formatStudentInstituteLabel = (
  institute: string | null | undefined,
) => {
  const normalizedInstitute = institute?.trim() ?? "";

  return normalizedInstitute === "" || normalizedInstitute === EMPTY_FIELD_VALUE
    ? emptyInstituteLabel
    : normalizedInstitute;
};
