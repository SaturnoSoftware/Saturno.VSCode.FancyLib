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
// File      : devBugReportTransport.test.ts                                  //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-16                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, it } from "node:test";

import { BugReport, BugReportTransport, createBugReport, disabledBugReportTransport } from "../Source/DevBugReport";

// -----------------------------------------------------------------------------
function sampleReport(): BugReport {
  return createBugReport({
    reportId: "11111111-1111-1111-1111-111111111111",
    capturedAtUtc: new Date("2026-09-16T00:00:00.000Z"),
    title: "layout breaks on wide monitors",
    environment: {
      extensionId: "saturno.fancy-align",
      extensionVersion: "1.2.3",
      buildChannel: "development",
      vscodeVersion: "1.95.0",
      platform: "win32",
    },
    document: { omitted: true, reason: "no_active_editor" },
    selection: { omitted: true, reason: "no_active_editor" },
    git: { omitted: true, reason: "not_requested" },
  });
}

// -----------------------------------------------------------------------------
describe("DevBugReport/Transport", () => {
  it("declines every dispatch by default, without ever attempting to send", async () => {
    const transport = disabledBugReportTransport();
    const result = await transport.dispatch(sampleReport());
    assert.equal(result.outcome, "declined");
  });

  it("BugReport carries no token, endpoint or credential field a transport could leak", () => {
    const report = sampleReport();
    const serialized = JSON.stringify(report).toLowerCase();
    for (const forbidden of ["token", "apikey", "api_key", "endpoint", "secret", "password"]) {
      assert.equal(serialized.includes(forbidden), false, `report serialization must not contain "${forbidden}"`);
    }
  });

  it("a fake transport can be substituted without the domain importing vscode, filesystem or network", async () => {
    const dispatched: BugReport[] = [];
    const fakeTransport: BugReportTransport = {
      dispatch: async (report) => {
        dispatched.push(report);
        return { outcome: "sent" };
      },
    };

    const result = await fakeTransport.dispatch(sampleReport());

    assert.equal(result.outcome, "sent");
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0].title, "layout breaks on wide monitors");
  });

  it("Transport.ts imports no vscode, filesystem, child_process or network module", () => {
    // __dirname is the compiled out/tests/ directory - a consumer that
    // compiles this test as part of its own npm test nests the output
    // deeper than this project's own tests/tsconfig.json does, so dropping
    // the first "out" path segment maps back to the source tree at any
    // nesting depth (same fix as packageContract.test.ts and
    // devBugReport.test.ts).
    const segments = __dirname.split(path.sep);
    const outIndex = segments.lastIndexOf("out");
    const sourceTestsDir =
      outIndex === -1 ? __dirname : [...segments.slice(0, outIndex), ...segments.slice(outIndex + 1)].join(path.sep);
    const sourcePath = path.join(sourceTestsDir, "..", "Source", "DevBugReport", "Transport.ts");
    const source = fs.readFileSync(sourcePath, "utf8");
    const importLine = /^\s*import\s+.*\sfrom\s+["']([^"']+)["']/gm;
    const forbidden = ["vscode", "fs", "node:fs", "child_process", "node:child_process", "http", "node:http", "https", "node:https", "net", "node:net"];
    let match: RegExpExecArray | null;
    while ((match = importLine.exec(source)) !== null) {
      assert.ok(!forbidden.includes(match[1]) && !match[1].startsWith("vscode"), `Transport.ts imports forbidden module "${match[1]}"`);
    }
  });
});
