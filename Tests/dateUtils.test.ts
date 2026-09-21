import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { FormatDateYYYYMMDD, ParseDate } from "../Source/DateUtils";

describe("FormatDateYYYYMMDD", () => {
  it("formats dates as YYYY-MM-DD", () => {
    const date = new Date(2026, 4, 28);
    assert.strictEqual(FormatDateYYYYMMDD(date), "2026-05-28");
  });

  it("pads single-digit months and days", () => {
    const date = new Date(2026, 0, 5);
    assert.strictEqual(FormatDateYYYYMMDD(date), "2026-01-05");
  });
});

describe("ParseDate", () => {
  it("parses a well-formed YYYY-MM-DD date", () => {
    const result = ParseDate("2026-05-28");
    assert.ok(result);
    assert.strictEqual(FormatDateYYYYMMDD(result as Date), "2026-05-28");
  });

  it("rejects a malformed date string", () => {
    assert.strictEqual(ParseDate("not-a-date"), null);
  });

  it("rejects a string that is not in YYYY-MM-DD shape", () => {
    assert.strictEqual(ParseDate("2026/05/28"), null);
  });
});
