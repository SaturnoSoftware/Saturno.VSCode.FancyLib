import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

describe("source-library package contract", () => {
  it("does not advertise JavaScript artifacts that its source-only build does not emit", () => {
    const packageJsonPath = path.join(__dirname, "..", "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
      private: boolean;
      main?: string;
      types?: string;
    };

    assert.strictEqual(packageJson.private, true);
    assert.strictEqual(packageJson.main, undefined);
    assert.strictEqual(packageJson.types, undefined);
  });

  it("declares ESLint as a development dependency for its lint command", () => {
    const packageJsonPath = path.join(__dirname, "..", "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    };

    assert.match(packageJson.scripts.lint, /eslint/);
    assert.ok(packageJson.devDependencies.eslint);
    assert.ok(packageJson.devDependencies["@typescript-eslint/parser"]);
    assert.ok(packageJson.devDependencies["@typescript-eslint/eslint-plugin"]);
  });
});
