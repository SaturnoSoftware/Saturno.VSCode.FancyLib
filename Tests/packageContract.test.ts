import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

/** A consumer's own npm test compiles this file into its own out/ tree at
 *  whatever nesting depth its tsconfig happens to use (a direct
 *  `Libraries/Saturno.VSCode.FancyLib` submodule checkout, or something
 *  deeper) - a fixed `__dirname`-relative depth breaks the moment that
 *  nesting differs from FancyLib's own repo layout.
 *
 *  package.json itself is never emitted into any `out/` tree, compiled here
 *  or in a consumer, so the search has to happen against the *source* tree.
 *  Both `tests/tsconfig.json` (rootDir "..") and a consumer's own tsconfig
 *  preserve the same relative structure under `out/` that the source has
 *  above it, so dropping the first `out` path segment maps the compiled
 *  directory back to its source counterpart; walking up from there for the
 *  package.json that actually declares this package, by name, then works at
 *  any nesting depth. */
// -----------------------------------------------------------------------------
const PACKAGE_NAME = "saturno-fancylib";
const MAX_ANCESTOR_LEVELS = 8;

// -----------------------------------------------------------------------------
function compiledDirToSourceDir(compiledDir: string): string {
  const segments = compiledDir.split(path.sep);
  const outIndex = segments.lastIndexOf("out");
  if (outIndex === -1) {
    return compiledDir;
  }
  return [...segments.slice(0, outIndex), ...segments.slice(outIndex + 1)].join(path.sep);
}

// -----------------------------------------------------------------------------
function findOwnPackageJson(): unknown {
  let dir = compiledDirToSourceDir(__dirname);
  for (let i = 0; i < MAX_ANCESTOR_LEVELS; i++) {
    const candidate = path.join(dir, "package.json");
    if (fs.existsSync(candidate)) {
      const parsed = JSON.parse(fs.readFileSync(candidate, "utf8")) as { name?: string };
      if (parsed.name === PACKAGE_NAME) {
        return parsed;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  throw new Error(`could not find a package.json named "${PACKAGE_NAME}" above ${__dirname}`);
}

describe("source-library package contract", () => {
  it("does not advertise JavaScript artifacts that its source-only build does not emit", () => {
    const packageJson = findOwnPackageJson() as { private: boolean; main?: string; types?: string };

    assert.strictEqual(packageJson.private, true);
    assert.strictEqual(packageJson.main, undefined);
    assert.strictEqual(packageJson.types, undefined);
  });

  it("declares ESLint as a development dependency for its lint command", () => {
    const packageJson = findOwnPackageJson() as {
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    };

    assert.match(packageJson.scripts.lint, /eslint/);
    assert.ok(packageJson.devDependencies.eslint);
    assert.ok(packageJson.devDependencies["@typescript-eslint/parser"]);
    assert.ok(packageJson.devDependencies["@typescript-eslint/eslint-plugin"]);
  });
});
