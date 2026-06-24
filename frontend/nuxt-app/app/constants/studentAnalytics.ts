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
  { key: "studentCode", label: "ID", rowHeader: true, width: "180px" },
  { key: "name", label: "Student", width: "180px" },
  { key: "email", label: "Email", tone: "muted", width: "240px" },
  { key: "institute", label: "Institute", width: "92px" },
  { key: "department", label: "Department", width: "120px" },
  { key: "city", label: "City", width: "100px" },
  { key: "gender", label: "Gender", width: "110px" },
  { key: "lastLogin", label: "Last Login", tone: "muted", width: "172px" },
  {
    key: "status",
    label: "Status",
    type: "status",
    warningValues: ["Inactive"],
    align: "center",
    width: "108px",
  },
  { key: "enrollments", label: "Enrollments", align: "right", width: "112px" },
  { key: "action", label: "Profile", type: "action", align: "center", width: "96px" },
];

export const studentProfileStats: Array<{
  label: string;
  key: keyof Student;
  suffix?: string;
}> = [
  { label: "Last login", key: "lastLogin" },
  { label: "Enrollments", key: "enrollments" },
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
