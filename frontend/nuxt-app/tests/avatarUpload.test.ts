import { describe, expect, it } from "vitest";
import { AVATAR_MAX_BYTES, avatarValidationError } from "../app/utils/avatarUpload";

describe("avatarValidationError", () => {
  it("accepts supported images at or below 2 MB", () => {
    expect(avatarValidationError({ type: "image/png", size: AVATAR_MAX_BYTES })).toBeNull();
  });

  it("rejects unsupported image types and oversized files", () => {
    expect(avatarValidationError({ type: "application/pdf", size: 100 })).toContain("JPG");
    expect(avatarValidationError({ type: "image/jpeg", size: AVATAR_MAX_BYTES + 1 })).toContain("2 MB");
  });
});
