import { describe, expect, it } from "vitest";
import { dashboardPathFor } from "../app/utils/authRouting";

describe("dashboardPathFor", () => {
  it.each([
    ["manager", "/manager/dashboard"],
    ["partner", "/partner/dashboard"],
    ["visitor", "/visitor/dashboard"],
  ] as const)("routes %s users to %s", (role, path) => {
    expect(dashboardPathFor({ id: 1, name: "Test", email: "test@example.com", role })).toBe(path);
  });

  it("routes missing or unknown users to login", () => {
    expect(dashboardPathFor(null)).toBe("/login");
    expect(dashboardPathFor({ id: 1, name: "Test", email: "test@example.com", role: "unknown" as "visitor" })).toBe("/login");
  });
});
