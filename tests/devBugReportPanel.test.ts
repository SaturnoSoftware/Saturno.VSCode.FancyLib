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
// File      : devBugReportPanel.test.ts                                      //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import * as assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EnvironmentInfo, StoredReport } from "../Source/DevBugReport";
import {
  ActiveEditorContext,
  DevBugReportCaptureConfig,
  DevBugReportPanelPorts,
  EvidenceChoice,
  GitIdentityAttempt,
  runOpenBugPanel,
} from "../Source/DevBugReportPanel";

// -----------------------------------------------------------------------------
const ENVIRONMENT: EnvironmentInfo = {
  extensionId: "saturno.fancy-align",
  extensionVersion: "1.2.3",
  buildChannel: "development",
  vscodeVersion: "1.95.0",
  platform: "win32",
};

// -----------------------------------------------------------------------------
const NO_EDITOR: ActiveEditorContext = { document: null, selection: null, selectedText: null };

// -----------------------------------------------------------------------------
const DEFAULT_CONFIG: DevBugReportCaptureConfig = {
  captureDocument: true,
  captureSelection: true,
  gitIdentityTimeoutMs: 500,
};

// -----------------------------------------------------------------------------
function makeFakePorts(overrides: Partial<DevBugReportPanelPorts> = {}): {
  ports: DevBugReportPanelPorts;
  savedFiles: { fileName: string; markdown: string }[];
  openedReports: StoredReport[];
} {
  const savedFiles: { fileName: string; markdown: string }[] = [];
  const openedReports: StoredReport[] = [];

  const ports: DevBugReportPanelPorts = {
    promptForTitle: async () => "Layout breaks on wide monitors",
    promptForEvidenceChoice: async (): Promise<EvidenceChoice | undefined> => ({
      includeSelectedText: false,
      includeGitIdentity: false,
    }),
    getActiveEditorContext: () => NO_EDITOR,
    getGitIdentity: async (): Promise<GitIdentityAttempt> => ({ outcome: "unavailable" }),
    getEnvironmentInfo: () => ENVIRONMENT,
    getCaptureConfig: () => DEFAULT_CONFIG,
    generateReportId: () => "11111111-1111-1111-1111-111111111111",
    now: () => new Date("2026-09-15T12:00:00.000Z"),
    saveReport: async (fileName, markdown) => {
      savedFiles.push({ fileName, markdown });
      return { path: `C:\\reports\\${fileName}`, uri: `file:///C:/reports/${fileName}` };
    },
    openReport: async (report) => {
      openedReports.push(report);
    },
    ...overrides,
  };

  return { ports, savedFiles, openedReports };
}

// -----------------------------------------------------------------------------
describe("DevBugReportPanel.runOpenBugPanel", () => {
  it("returns cancelled when the title prompt is dismissed", async () => {
    const { ports } = makeFakePorts({ promptForTitle: async () => undefined });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "cancelled");
  });

  it("omits document and selection as no_active_editor when there is no active editor", async () => {
    const { ports } = makeFakePorts();
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.deepEqual(outcome.report.document, { omitted: true, reason: "no_active_editor" });
    assert.deepEqual(outcome.report.selection, { omitted: true, reason: "no_active_editor" });
  });

  it("captures an untitled document", async () => {
    const { ports } = makeFakePorts({
      getActiveEditorContext: () => ({
        document: { untitled: true, languageId: "plaintext" },
        selection: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 }, isEmpty: true },
        selectedText: null,
      }),
    });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.deepEqual(outcome.report.document, { untitled: true, languageId: "plaintext" });
  });

  it("omits document and selection as not_requested when disabled by configuration", async () => {
    const { ports } = makeFakePorts({
      getCaptureConfig: () => ({ ...DEFAULT_CONFIG, captureDocument: false, captureSelection: false }),
      getActiveEditorContext: () => ({
        document: { untitled: true, languageId: "plaintext" },
        selection: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 }, isEmpty: true },
        selectedText: "would have been attached",
      }),
    });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.deepEqual(outcome.report.document, { omitted: true, reason: "not_requested" });
    assert.deepEqual(outcome.report.selection, { omitted: true, reason: "not_requested" });
  });

  it("never queries Git when the user does not opt into Git identity evidence", async () => {
    let gitQueried = false;
    const { ports } = makeFakePorts({
      getGitIdentity: async () => {
        gitQueried = true;
        return { outcome: "found", identity: { branch: "main", shortCommit: "abc1234" } };
      },
    });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(gitQueried, false);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.deepEqual(outcome.report.git, { omitted: true, reason: "not_requested" });
  });

  for (const [outcomeName, expectedReason] of [
    ["unavailable", "git_unavailable"],
    ["timed_out", "git_timed_out"],
    ["error", "git_error"],
  ] as const) {
    it(`degrades a Git ${outcomeName} query to reason ${expectedReason}`, async () => {
      const { ports } = makeFakePorts({
        promptForEvidenceChoice: async () => ({ includeSelectedText: false, includeGitIdentity: true }),
        getGitIdentity: async (): Promise<GitIdentityAttempt> => ({ outcome: outcomeName }),
      });
      const outcome = await runOpenBugPanel(ports);
      assert.equal(outcome.kind, "saved");
      if (outcome.kind !== "saved") return;
      assert.deepEqual(outcome.report.git, { omitted: true, reason: expectedReason });
    });
  }

  it("attaches a found Git identity only after explicit opt-in", async () => {
    const { ports } = makeFakePorts({
      promptForEvidenceChoice: async () => ({ includeSelectedText: false, includeGitIdentity: true }),
      getGitIdentity: async (): Promise<GitIdentityAttempt> => ({
        outcome: "found",
        identity: { branch: "main", shortCommit: "abc1234" },
      }),
    });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.deepEqual(outcome.report.git, { branch: "main", shortCommit: "abc1234" });
  });

  it("attaches selected text only after explicit opt-in", async () => {
    const { ports } = makeFakePorts({
      getActiveEditorContext: () => ({ ...NO_EDITOR, selectedText: "const secret = 1;" }),
      promptForEvidenceChoice: async () => ({ includeSelectedText: true, includeGitIdentity: false }),
    });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.equal(outcome.report.evidence.selectedText, "const secret = 1;");
  });

  it("dismissing the evidence step attaches nothing rather than cancelling the report", async () => {
    const { ports } = makeFakePorts({ promptForEvidenceChoice: async () => undefined });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.deepEqual(outcome.report.evidence, {});
  });

  it("saves the rendered report and returns the stored location", async () => {
    const { ports, savedFiles } = makeFakePorts();
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.equal(savedFiles.length, 1);
    assert.ok(savedFiles[0].markdown.includes("Layout breaks on wide monitors"));
    assert.ok(outcome.stored.path.endsWith(savedFiles[0].fileName));
    assert.equal(outcome.openFailed, false);
  });

  it("reports openFailed without discarding the saved report when opening fails", async () => {
    const { ports } = makeFakePorts({
      openReport: async () => {
        throw new Error("no editor host available");
      },
    });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "saved");
    if (outcome.kind !== "saved") return;
    assert.equal(outcome.openFailed, true);
  });

  it("returns invalid diagnostics instead of throwing on a blank title", async () => {
    const { ports } = makeFakePorts({ promptForTitle: async () => "   " });
    const outcome = await runOpenBugPanel(ports);
    assert.equal(outcome.kind, "invalid");
    if (outcome.kind !== "invalid") return;
    assert.ok(outcome.diagnostics.some((d) => d.field === "title"));
  });
});
