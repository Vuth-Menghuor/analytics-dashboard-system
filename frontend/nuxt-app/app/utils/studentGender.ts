import { chartOtherColor, chartPalette } from "~/constants/colors";

const EMPTY_GENDER_VALUE = "Not filled";

export const formatStudentGenderLabel = (gender: string): string =>
  gender === EMPTY_GENDER_VALUE ? "N/A" : gender;

const genderChartColors = {
  male: chartPalette[0],
  female: chartPalette[5],
  other: chartPalette[4],
  unknown: chartOtherColor,
} as const;

export const getStudentGenderChartColor = (gender: string) => {
  const normalizedGender = gender.trim().toLowerCase();
  return (
    normalizedGender === "male"
      ? genderChartColors.male
      : normalizedGender === "female"
        ? genderChartColors.female
        : normalizedGender === "other" ||
            normalizedGender.includes("non-binary") ||
            normalizedGender.includes("nonbinary")
          ? genderChartColors.other
          : genderChartColors.unknown
  );
};
