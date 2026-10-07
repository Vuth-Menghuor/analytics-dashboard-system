import { describe, expect, it } from "vitest";
import { serializeRowsAsCsv } from "../app/utils/exportCsv";

describe("serializeRowsAsCsv", () => {
  it("escapes commas, quotes, and line breaks", () => {
    expect(serializeRowsAsCsv(
      [{ key: "name", label: "Student name" }, { key: "note", label: "Note" }],
      [{ name: 'Sok, "Dara"', note: "First\nline" }],
    )).toBe('Student name,Note\n"Sok, ""Dara""","First\nline"');
  });
});
