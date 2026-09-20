import { describe, it } from "node:test";
import * as assert from "node:assert";
import { Clamp, NormalizeInteger, NormalizeChar, NormalizeStringArray } from "../Source/Utils";

describe("clamp", () => {
  it("should return the value when it is within the range", () => {
    assert.strictEqual(Clamp(5, 0, 10), 5);
  });

  it("should return min when value is below the minimum", () => {
    assert.strictEqual(Clamp(-5, 0, 10), 0);
  });

  it("should return max when value is above the maximum", () => {
    assert.strictEqual(Clamp(15, 0, 10), 10);
  });

  it("should handle negative ranges correctly", () => {
    assert.strictEqual(Clamp(-5, -10, -1), -5);
    assert.strictEqual(Clamp(-15, -10, -1), -10);
    assert.strictEqual(Clamp(0, -10, -1), -1);
  });

  it("should handle edge cases where min equals max", () => {
    assert.strictEqual(Clamp(5, 10, 10), 10);
    assert.strictEqual(Clamp(10, 10, 10), 10);
    assert.strictEqual(Clamp(15, 10, 10), 10);
  });
});

describe("normalizeInteger", () => {
  it("should normalize a valid integer within range", () => {
    assert.strictEqual(NormalizeInteger(5, 0, 10, 3), 5);
  });

  it("should return default value when input is undefined", () => {
    assert.strictEqual(NormalizeInteger(undefined, 0, 10, 3), 3);
  });

  it("should truncate decimal values", () => {
    assert.strictEqual(NormalizeInteger(5.7, 0, 10, 3), 5);
    assert.strictEqual(NormalizeInteger(5.2, 0, 10, 3), 5);
    assert.strictEqual(NormalizeInteger(9.9, 0, 10, 3), 9);
  });

  it("should clamp values outside the range", () => {
    assert.strictEqual(NormalizeInteger(15, 0, 10, 3), 10);
    assert.strictEqual(NormalizeInteger(-5, 0, 10, 3), 0);
  });

  it("should handle non-finite values by returning default", () => {
    assert.strictEqual(NormalizeInteger(NaN, 0, 10, 3), 3);
    assert.strictEqual(NormalizeInteger(Infinity, 0, 10, 3), 3);
    assert.strictEqual(NormalizeInteger(-Infinity, 0, 10, 3), 3);
  });
});

describe("normalizeChar", () => {
  it("should return the first character of a non-empty string", () => {
    assert.strictEqual(NormalizeChar("-", "*"), "-");
  });

  it("should return the first character when input has multiple characters", () => {
    assert.strictEqual(NormalizeChar("---", "*"), "-");
    assert.strictEqual(NormalizeChar("abc", "*"), "a");
  });

  it("should return default value when input is empty string", () => {
    assert.strictEqual(NormalizeChar("", "*"), "*");
  });

  it("should return default value when input is undefined", () => {
    assert.strictEqual(NormalizeChar(undefined, "*"), "*");
  });

  it("should handle special characters correctly", () => {
    assert.strictEqual(NormalizeChar("@@@", "#"), "@");
    assert.strictEqual(NormalizeChar("!", "?"), "!");
    assert.strictEqual(NormalizeChar("", "="), "=");
  });
});

describe("normalizeStringArray", () => {
  it("should return the array when it contains valid strings", () => {
    const result = NormalizeStringArray(["hello", "world"], []);
    assert.deepStrictEqual(result, ["hello", "world"]);
  });

  it("should filter out non-string elements", () => {
    const input: any[] = [1, "test", null, "valid", undefined, 42];
    const result = NormalizeStringArray(input, []);
    assert.deepStrictEqual(result, ["test", "valid"]);
  });

  it("should return default array when input is undefined", () => {
    const result = NormalizeStringArray(undefined, ["default"]);
    assert.deepStrictEqual(result, ["default"]);
  });

  it("should return default array when input is empty", () => {
    const result = NormalizeStringArray([], ["default"]);
    assert.deepStrictEqual(result, ["default"]);
  });

  it("should remove carriage returns from strings", () => {
    const input = ["line1\r", "line2\r\n", "line3"];
    const result = NormalizeStringArray(input, []);
    assert.deepStrictEqual(result, ["line1", "line2\n", "line3"]);
  });
});
