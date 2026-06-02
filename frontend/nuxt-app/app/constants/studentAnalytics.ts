import type { AnalyticsTableColumn, Student } from "~/types/analytics";

export const studentInstituteAllOption = "All institutes";
export const studentDepartmentAllOption = "All departments";
export const studentCityAllOption = "All cities";

export const studentGenderOptions = [
  "All genders",
  "Male",
  "Female",
  "Not filled",
];
export const studentStatusOptions = ["All statuses", "Active", "Inactive"];

export const studentTableColumns: AnalyticsTableColumn[] = [
  { key: "name", label: "Student", rowHeader: true, width: "18%" },
  { key: "studentCode", label: "ID", tone: "muted", width: "12%" },
  { key: "email", label: "Email", tone: "muted", width: "18%" },
  { key: "institute", label: "Institute", width: "8%" },
  { key: "department", label: "Department", width: "14%" },
  { key: "city", label: "City", width: "10%" },
  { key: "gender", label: "Gender", width: "9%" },
  {
    key: "status",
    label: "Status",
    type: "status",
    warningValues: ["Inactive"],
    width: "9%",
  },
  { key: "enrollments", label: "Enrollments", width: "8%" },
  { key: "completions", label: "Completions", width: "8%" },
  { key: "action", label: "Profile", type: "action", width: "8%" },
];

export const studentProfileStats: Array<{
  label: string;
  key: keyof Student;
  suffix?: string;
}> = [
  { label: "Last login", key: "lastLogin" },
  { label: "Enrollments", key: "enrollments" },
  { label: "Completions", key: "completions" },
  { label: "Status", key: "status" },
];

export const studentProfileDetails: Array<{
  label: string;
  key: keyof Student;
  type?: "boolean";
}> = [
  { label: "Institute", key: "institute" },
  { label: "Department", key: "department" },
  { label: "City", key: "city" },
  { label: "Gender", key: "gender" },
  { label: "Confirmed", key: "confirmed", type: "boolean" },
];
