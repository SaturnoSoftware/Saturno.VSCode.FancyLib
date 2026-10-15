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
function _FindOwnPackageRoot(): string {
  let dir = compiledDirToSourceDir(__dirname);
  for (let i = 0; i < MAX_ANCESTOR_LEVELS; i++) {
    const candidate = path.join(dir, "package.json");
    if (fs.existsSync(candidate)) {
      const parsed = JSON.parse(fs.readFileSync(candidate, "utf8")) as { name?: string };
      if (parsed.name === PACKAGE_NAME) {
        return dir;
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

// -----------------------------------------------------------------------------
function findOwnPackageJson(): unknown {
  const package_path = path.join(_FindOwnPackageRoot(), "package.json");
  return JSON.parse(fs.readFileSync(package_path, "utf8")) as unknown;
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

  it("routes the source build and package through the central SPB driver", () => {
    const root_dir = _FindOwnPackageRoot();
    const contract = JSON.parse(fs.readFileSync(path.join(root_dir, "spb.project.json"), "utf8")) as {
      schema: string;
      family: string;
      platform: string;
      driver: {
        native_build_script: string;
        build_items: string[];
        required_files: string[];
        package_metadata_files: string[];
      };
    };
    const package_json = JSON.parse(fs.readFileSync(path.join(root_dir, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const build_hook = fs.readFileSync(path.join(root_dir, "Scripts", "build.ps1"), "utf8");
    const package_hook = fs.readFileSync(path.join(root_dir, "Scripts", "package.ps1"), "utf8");

    assert.strictEqual(contract.schema, "saturno-spb-project/v2");
    assert.strictEqual(contract.family, "fancy");
    assert.strictEqual(contract.platform, "node-source-library");
    assert.strictEqual(contract.driver.native_build_script, "compile");
    assert.match(package_json.scripts.compile, /tsc/);
    assert.ok(contract.driver.build_items.includes("Source"));
    assert.ok(contract.driver.build_items.includes("package.json"));
    assert.ok(contract.driver.build_items.includes("LICENSE.txt"));
    assert.ok(!contract.driver.build_items.includes("README.md"));
    assert.ok(contract.driver.required_files.includes("Source/index.ts"));
    assert.ok(contract.driver.package_metadata_files.includes("README.md"));
    assert.match(build_hook, /SpbDriverRoot/);
    assert.match(build_hook, /node-source-library\.ps1/);
    assert.match(build_hook, /Invoke-SpbNodeSourceLibraryBuild/);
    assert.match(package_hook, /SpbDriverRoot/);
    assert.match(package_hook, /node-source-library\.ps1/);
    assert.match(package_hook, /Invoke-SpbNodeSourceLibraryPackage/);
    assert.strictEqual(package_json.scripts.publish, undefined);
  });
});
