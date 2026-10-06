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
// File      : devBugReportStorage.test.ts                                    //
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
import { after, before, beforeEach, describe, it } from "node:test";

import {
  DestinationRefusedError,
  buildOpenableUri,
  reserveReportFile,
  resolveDestinationDirectory,
} from "../Source/DevBugReport/Storage";

// -----------------------------------------------------------------------------
describe("DevBugReport/Storage", () => {
  let workDir: string;

  before(() => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), "fancylib-devbugreport-"));
  });

  after(() => {
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  describe("resolveDestinationDirectory", () => {
    it("uses the default directory when nothing is configured", () => {
      const defaultDirectory = path.join(workDir, "default");
      const resolved = resolveDestinationDirectory({ defaultDirectory, expectedRoots: [] });
      assert.equal(resolved, path.normalize(defaultDirectory));
    });

    it("accepts a configured directory inside an expected root", () => {
      const root = path.join(workDir, "allowed-root");
      const configured = path.join(root, "reports");
      const resolved = resolveDestinationDirectory({
        defaultDirectory: path.join(workDir, "default"),
        configuredDirectory: configured,
        expectedRoots: [root],
      });
      assert.equal(resolved, path.normalize(configured));
    });

    it("refuses a relative configured directory", () => {
      assert.throws(
        () =>
          resolveDestinationDirectory({
            defaultDirectory: path.join(workDir, "default"),
            configuredDirectory: "relative/reports",
            expectedRoots: [workDir],
          }),
        DestinationRefusedError,
      );
    });

    it("refuses a configured directory outside every expected root", () => {
      const root = path.join(workDir, "allowed-root");
      const outside = path.join(workDir, "somewhere-else");
      assert.throws(
        () =>
          resolveDestinationDirectory({
            defaultDirectory: path.join(workDir, "default"),
            configuredDirectory: outside,
            expectedRoots: [root],
          }),
        DestinationRefusedError,
      );
    });

    it("refuses a `..` escape dressed up as an absolute path", () => {
      const root = path.join(workDir, "allowed-root");
      const escape = path.join(root, "..", "..", "etc");
      assert.throws(
        () =>
          resolveDestinationDirectory({
            defaultDirectory: path.join(workDir, "default"),
            configuredDirectory: escape,
            expectedRoots: [root],
          }),
        DestinationRefusedError,
      );
    });
  });

  describe("reserveReportFile", () => {
    let directory: string;

    beforeEach(() => {
      directory = fs.mkdtempSync(path.join(workDir, "reserve-"));
    });

    it("writes UTF-8 content and returns an openable URI", () => {
      const result = reserveReportFile(directory, "report.md", "# titulo com acento e emoji 🐛");
      assert.equal(fs.readFileSync(result.path, "utf8"), "# titulo com acento e emoji 🐛");
      assert.ok(result.uri.startsWith("file://"));
    });

    it("creates the destination directory when it does not exist yet", () => {
      const nested = path.join(directory, "nested", "deeper");
      const result = reserveReportFile(nested, "report.md", "content");
      assert.equal(fs.existsSync(result.path), true);
    });

    it("gives a concurrent same-name write a distinct file instead of overwriting", () => {
      const first = reserveReportFile(directory, "report.md", "first");
      const second = reserveReportFile(directory, "report.md", "second");
      assert.notEqual(first.path, second.path);
      assert.equal(fs.readFileSync(first.path, "utf8"), "first");
      assert.equal(fs.readFileSync(second.path, "utf8"), "second");
    });

    it("keeps allocating a new suffix across repeated collisions", () => {
      const paths = new Set<string>();
      for (let i = 0; i < 5; i++) {
        const result = reserveReportFile(directory, "report.md", `attempt-${i}`);
        paths.add(result.path);
      }
      assert.equal(paths.size, 5);
    });
  });

  describe("buildOpenableUri", () => {
    it("percent-encodes a space in the path", () => {
      const uri = buildOpenableUri(path.join("C:", "Users", "a b", "report.md"));
      assert.ok(uri.includes("%20"));
      assert.ok(!uri.includes(" "));
    });

    it("uses forward slashes regardless of platform separators", () => {
      const uri = buildOpenableUri(["C:", "Users", "a", "report.md"].join(path.sep));
      assert.ok(!uri.slice("file://".length).includes("\\"));
    });
  });
});
