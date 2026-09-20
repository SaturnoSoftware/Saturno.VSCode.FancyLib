import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { FormatDateYYYYMMDD } from "../Source/DateUtils";
import { GetDefaultUserAppRoot, ResolveLastModifiedDate } from "../Source/FileUtils";

describe("ResolveLastModifiedDate", () => {
  it("prefers the date of the last Git commit over the file timestamp", () => {
    const result = ResolveLastModifiedDate(
      "/repo/src/main.ts",
      "/repo",
      () => new Date(2026, 4, 28),
      () => new Date(2026, 5, 1)
    );

    assert.strictEqual(FormatDateYYYYMMDD(result), "2026-05-28");
  });

  it("falls back to the file modification timestamp without Git metadata", () => {
    const result = ResolveLastModifiedDate(
      "/repo/src/main.ts",
      null,
      () => null,
      () => new Date(2026, 5, 1)
    );

    assert.strictEqual(FormatDateYYYYMMDD(result), "2026-06-01");
  });

  it("falls back to the current date when neither source has a date", () => {
    const before = new Date();
    const result = ResolveLastModifiedDate(
      "/repo/src/main.ts",
      "/repo",
      () => null,
      () => null
    );
    assert.ok(result.getTime() >= before.getTime());
  });
});

describe("GetDefaultUserAppRoot - platform handling", () => {
  it("returns Windows path for win32 platform", () => {
    const env = { APPDATA: "C:\\Users\\Test\\AppData\\Roaming" };
    const result = GetDefaultUserAppRoot("test-app", "win32", env, "C:\\Users\\Test");
    assert.ok(result.includes("AppData"));
    assert.ok(result.includes("test-app"));
  });

  it("returns macOS path for darwin platform", () => {
    const result = GetDefaultUserAppRoot("test-app", "darwin", {}, "/Users/test");
    assert.ok(result.includes("Library"));
    assert.ok(result.includes("Application Support"));
    assert.ok(result.includes("test-app"));
  });

  it("returns Linux path for linux platform", () => {
    const result = GetDefaultUserAppRoot("test-app", "linux", {}, "/home/test");
    assert.ok(result.includes(".config"));
    assert.ok(result.includes("test-app"));
  });

  it("handles missing APPDATA on Windows", () => {
    const result = GetDefaultUserAppRoot("test-app", "win32", {}, "C:\\Users\\Test");
    assert.ok(result.includes("AppData"));
  });

  it("handles unusual home directory paths", () => {
    const weirdHome = "/home/user with spaces/测试";
    const result = GetDefaultUserAppRoot("test-app", "linux", {}, weirdHome);
    assert.ok(result.startsWith(weirdHome));
  });
});
