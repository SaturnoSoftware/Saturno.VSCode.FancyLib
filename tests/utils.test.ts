import { describe, it } from "node:test";
import * as assert from "node:assert";
import { clamp, normalizeInteger, normalizeChar, normalizeStringArray } from "../src/Utils";

describe("clamp", () => {
  it("should return the value when it is within the range", () => {
    assert.strictEqual(clamp(5, 0, 10), 5);
  });

  it("should return min when value is below the minimum", () => {
    assert.strictEqual(clamp(-5, 0, 10), 0);
  });

  it("should return max when value is above the maximum", () => {
    assert.strictEqual(clamp(15, 0, 10), 10);
  });

  it("should handle negative ranges correctly", () => {
    assert.strictEqual(clamp(-5, -10, -1), -5);
    assert.strictEqual(clamp(-15, -10, -1), -10);
    assert.strictEqual(clamp(0, -10, -1), -1);
  });

  it("should handle edge cases where min equals max", () => {
    assert.strictEqual(clamp(5, 10, 10), 10);
    assert.strictEqual(clamp(10, 10, 10), 10);
    assert.strictEqual(clamp(15, 10, 10), 10);
  });
});

describe("normalizeInteger", () => {
  it("should normalize a valid integer within range", () => {
    assert.strictEqual(normalizeInteger(5, 0, 10, 3), 5);
  });

  it("should return default value when input is undefined", () => {
    assert.strictEqual(normalizeInteger(undefined, 0, 10, 3), 3);
  });

  it("should truncate decimal values", () => {
    assert.strictEqual(normalizeInteger(5.7, 0, 10, 3), 5);
    assert.strictEqual(normalizeInteger(5.2, 0, 10, 3), 5);
    assert.strictEqual(normalizeInteger(9.9, 0, 10, 3), 9);
  });

  it("should clamp values outside the range", () => {
    assert.strictEqual(normalizeInteger(15, 0, 10, 3), 10);
    assert.strictEqual(normalizeInteger(-5, 0, 10, 3), 0);
  });

  it("should handle non-finite values by returning default", () => {
    assert.strictEqual(normalizeInteger(NaN, 0, 10, 3), 3);
    assert.strictEqual(normalizeInteger(Infinity, 0, 10, 3), 3);
    assert.strictEqual(normalizeInteger(-Infinity, 0, 10, 3), 3);
  });
});

describe("normalizeChar", () => {
  it("should return the first character of a non-empty string", () => {
    assert.strictEqual(normalizeChar("-", "*"), "-");
  });

  it("should return the first character when input has multiple characters", () => {
    assert.strictEqual(normalizeChar("---", "*"), "-");
    assert.strictEqual(normalizeChar("abc", "*"), "a");
  });

  it("should return default value when input is empty string", () => {
    assert.strictEqual(normalizeChar("", "*"), "*");
  });

  it("should return default value when input is undefined", () => {
    assert.strictEqual(normalizeChar(undefined, "*"), "*");
  });

  it("should handle special characters correctly", () => {
    assert.strictEqual(normalizeChar("@@@", "#"), "@");
    assert.strictEqual(normalizeChar("!", "?"), "!");
    assert.strictEqual(normalizeChar("", "="), "=");
  });
});

describe("normalizeStringArray", () => {
  it("should return the array when it contains valid strings", () => {
    const result = normalizeStringArray(["hello", "world"], []);
    assert.deepStrictEqual(result, ["hello", "world"]);
  });

  it("should filter out non-string elements", () => {
    const input: any[] = [1, "test", null, "valid", undefined, 42];
    const result = normalizeStringArray(input, []);
    assert.deepStrictEqual(result, ["test", "valid"]);
  });

  it("should return default array when input is undefined", () => {
    const result = normalizeStringArray(undefined, ["default"]);
    assert.deepStrictEqual(result, ["default"]);
  });

  it("should return default array when input is empty", () => {
    const result = normalizeStringArray([], ["default"]);
    assert.deepStrictEqual(result, ["default"]);
  });

  it("should remove carriage returns from strings", () => {
    const input = ["line1\r", "line2\r\n", "line3"];
    const result = normalizeStringArray(input, []);
    assert.deepStrictEqual(result, ["line1", "line2\n", "line3"]);
  });
});
