// -------------------------------------------------------------------------- //
//                               *       +                                    //
//                         '                  |                               //
//                     ()    .-.,="``"=.    - o -                             //
//                           '=/_       \\     |                              //
//                        *   |  '=._    |                                    //
//                             \\     `=./`,        '                         //
//                          .   '=.__.=' `='      *                           //
//                                                                            //
//                                                                            //
// File      : buildIsolation.test.ts                                         //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { after, before, describe, it } from "node:test";

import {
  assertProductionBuildIsolation,
  defaultBuildChannelIsolationContract,
  findManifestViolations,
  findOutputViolations,
} from "../Source/BuildIsolation";

// -----------------------------------------------------------------------------
const CLEAN_MANIFEST = {
  contributes: {
    commands: [{ command: "saturno-fancy-align.alignAuto" }, { command: "saturno-fancy-align.compareSelections" }],
    menus: {
      commandPalette: [{ command: "saturno-fancy-align.alignAuto" }],
      "editor/context": [{ command: "saturno-fancy-align.compareSelections", when: "editorHasSelection" }],
    },
    configuration: { properties: { "saturno-fancy-align.notPartOf": {} } },
  },
};

// -----------------------------------------------------------------------------
const CONTAMINATED_MANIFEST = {
  contributes: {
    commands: [{ command: "saturno-fancy-align.alignAuto" }, { command: "saturno-fancy-align.dev.reportBug" }],
    menus: {
      commandPalette: [
        { command: "saturno-fancy-align.alignAuto" },
        { command: "saturno-fancy-align.dev.reportBug", when: "saturnoFancyAlign.devMode" },
      ],
    },
    configuration: { properties: { "saturno-fancy-align.dev.brainPath": {} } },
  },
};

// -----------------------------------------------------------------------------
describe("BuildIsolation.findManifestViolations", () => {
  const contract = defaultBuildChannelIsolationContract();

  it("finds nothing in a manifest with no dev commands, menus or settings", () => {
    assert.deepEqual(findManifestViolations(CLEAN_MANIFEST, contract), []);
  });

  it("does not flag an unrelated menu entry for a production command", () => {
    const violations = findManifestViolations(CLEAN_MANIFEST, contract);
    assert.equal(
      violations.some((v) => v.detail.includes("compareSelections")),
      false
    );
  });

  it("flags a dev command left in contributes.commands", () => {
    const violations = findManifestViolations(CONTAMINATED_MANIFEST, contract);
    assert.ok(violations.some((v) => v.kind === "command" && v.detail === "saturno-fancy-align.dev.reportBug"));
  });

  it("flags a dev command referenced from a menu even when other menu entries are fine", () => {
    const violations = findManifestViolations(CONTAMINATED_MANIFEST, contract);
    assert.ok(violations.some((v) => v.kind === "menu" && v.detail.includes("saturno-fancy-align.dev.reportBug")));
  });

  it("flags a dev configuration key", () => {
    const violations = findManifestViolations(CONTAMINATED_MANIFEST, contract);
    assert.ok(violations.some((v) => v.kind === "configuration" && v.detail === "saturno-fancy-align.dev.brainPath"));
  });
});

// -----------------------------------------------------------------------------
describe("BuildIsolation.findOutputViolations", () => {
  let outputDirectory: string;

  before(() => {
    outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "fancylib-buildisolation-"));
    fs.mkdirSync(path.join(outputDirectory, "Sources"), { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, "Sources", "extension.js"), "");
  });

  after(() => {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
  });

  it("finds nothing when no path segment matches the dev pattern", () => {
    assert.deepEqual(findOutputViolations(outputDirectory, defaultBuildChannelIsolationContract()), []);
  });

  it("flags a compiled file under a dev/ output directory", () => {
    fs.mkdirSync(path.join(outputDirectory, "Sources", "dev"), { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, "Sources", "dev", "report.js"), "");
    const violations = findOutputViolations(outputDirectory, defaultBuildChannelIsolationContract());
    assert.ok(violations.some((v) => v.kind === "output-file" && v.detail === "Sources/dev/report.js"));
  });
});

// -----------------------------------------------------------------------------
describe("BuildIsolation.assertProductionBuildIsolation (deliberately injected violations)", () => {
  let root: string;

  before(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "fancylib-buildisolation-e2e-"));
  });

  after(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("is clean for a manifest and output tree with no dev artifacts", () => {
    const packageJsonPath = path.join(root, "clean-package.json");
    fs.writeFileSync(packageJsonPath, JSON.stringify(CLEAN_MANIFEST));
    const outputDirectory = path.join(root, "clean-out");
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, "extension.js"), "");

    const violations = assertProductionBuildIsolation({ packageJsonPath, outputDirectory });
    assert.deepEqual(violations, []);
  });

  it("fails when a dev command is deliberately injected into an otherwise-clean manifest", () => {
    const packageJsonPath = path.join(root, "contaminated-package.json");
    fs.writeFileSync(packageJsonPath, JSON.stringify(CONTAMINATED_MANIFEST));
    const outputDirectory = path.join(root, "contaminated-out");
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, "extension.js"), "");

    const violations = assertProductionBuildIsolation({ packageJsonPath, outputDirectory });
    assert.ok(violations.length > 0);
  });

  it("fails when a dev-only compiled file is deliberately left in an otherwise-clean output tree", () => {
    const packageJsonPath = path.join(root, "clean-package-2.json");
    fs.writeFileSync(packageJsonPath, JSON.stringify(CLEAN_MANIFEST));
    const outputDirectory = path.join(root, "leaked-out");
    fs.mkdirSync(path.join(outputDirectory, "dev"), { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, "dev", "reportBug.js"), "");

    const violations = assertProductionBuildIsolation({ packageJsonPath, outputDirectory });
    assert.ok(violations.some((v) => v.kind === "output-file"));
  });
});
