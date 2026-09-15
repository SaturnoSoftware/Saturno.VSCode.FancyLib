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
// File      : DevBugReportPanel.ts                                           //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * VSCODEKIT-0020: the Open Bug panel workflow, orchestrated entirely against
 * an injected `DevBugReportPanelPorts` - this file itself never imports
 * "vscode". A consuming extension's own extension.ts is the only place that
 * wires the ports to real vscode APIs (input boxes, workspace configuration,
 * an async git query, `vscode.workspace.fs`/`vscode.window.showTextDocument`
 * through the Storage.ts sink); that keeps this orchestration layer, and the
 * domain and storage modules it calls into, testable without a running
 * VS Code host and free of any synchronous Git call on the UI path.
 */

import {
  BugReport,
  buildReportFileName,
  createBugReport,
  EditorDocumentReference,
  EnvironmentInfo,
  EvidenceSelection,
  GitIdentity,
  Omittable,
  renderBugReportMarkdown,
  SelectionRange,
  StoredReport,
  validateBugReportInput,
  ValidationDiagnostic,
} from "./DevBugReport";

// -----------------------------------------------------------------------------
export interface DevBugReportCaptureConfig {
  captureDocument: boolean;
  captureSelection: boolean;
  gitIdentityTimeoutMs: number;
}

// -----------------------------------------------------------------------------
export interface ActiveEditorContext {
  document: EditorDocumentReference | null;
  selection: SelectionRange | null;
  selectedText: string | null;
}

// -----------------------------------------------------------------------------
export interface EvidenceChoice {
  includeSelectedText: boolean;
  includeGitIdentity: boolean;
}

// -----------------------------------------------------------------------------
export type GitIdentityAttempt =
  | { outcome: "found"; identity: GitIdentity }
  | { outcome: "unavailable" }
  | { outcome: "timed_out" }
  | { outcome: "error" };

/**
 * Every method the panel needs from the outside world. A real extension.ts
 * implements this against vscode; tests implement it against plain fakes -
 * neither side needs the other.
 */
// -----------------------------------------------------------------------------
export interface DevBugReportPanelPorts {
  promptForTitle(): Promise<string | undefined>;
  /** `undefined` means the user dismissed the evidence step without
   *  choosing anything, which is treated as "attach nothing" rather than
   *  as cancelling the whole report - the title was already committed. */
  promptForEvidenceChoice(): Promise<EvidenceChoice | undefined>;
  getActiveEditorContext(): ActiveEditorContext;
  getGitIdentity(timeoutMs: number): Promise<GitIdentityAttempt>;
  getEnvironmentInfo(): EnvironmentInfo;
  getCaptureConfig(): DevBugReportCaptureConfig;
  generateReportId(): string;
  now(): Date;
  saveReport(fileName: string, markdown: string): Promise<StoredReport>;
  openReport(report: StoredReport): Promise<void>;
}

// -----------------------------------------------------------------------------
export type OpenBugPanelOutcome =
  | { kind: "cancelled" }
  | { kind: "invalid"; diagnostics: ValidationDiagnostic[] }
  | { kind: "saved"; report: BugReport; stored: StoredReport; openFailed: boolean };

// -----------------------------------------------------------------------------
function resolveDocumentAndSelection(
  config: DevBugReportCaptureConfig,
  context: ActiveEditorContext
): { document: Omittable<EditorDocumentReference>; selection: Omittable<SelectionRange> } {
  const document: Omittable<EditorDocumentReference> = !config.captureDocument
    ? { omitted: true, reason: "not_requested" }
    : (context.document ?? { omitted: true, reason: "no_active_editor" });

  const selection: Omittable<SelectionRange> = !config.captureSelection
    ? { omitted: true, reason: "not_requested" }
    : (context.selection ?? { omitted: true, reason: "no_active_editor" });

  return { document, selection };
}

// -----------------------------------------------------------------------------
async function resolveGitIdentity(
  ports: DevBugReportPanelPorts,
  config: DevBugReportCaptureConfig,
  wantsGitIdentity: boolean
): Promise<Omittable<GitIdentity>> {
  if (!wantsGitIdentity) {
    return { omitted: true, reason: "not_requested" };
  }
  const attempt = await ports.getGitIdentity(config.gitIdentityTimeoutMs);
  switch (attempt.outcome) {
    case "found":
      return attempt.identity;
    case "unavailable":
      return { omitted: true, reason: "git_unavailable" };
    case "timed_out":
      return { omitted: true, reason: "git_timed_out" };
    case "error":
      return { omitted: true, reason: "git_error" };
  }
}

/**
 * The one entry point extension.ts calls for the "Open Bug" command. Never
 * throws on a user-facing scenario (cancel, missing editor, invalid title,
 * a Git query that times out, a save that cannot be opened afterwards) -
 * every one of those is a variant of OpenBugPanelOutcome instead.
 */
// -----------------------------------------------------------------------------
export async function runOpenBugPanel(ports: DevBugReportPanelPorts): Promise<OpenBugPanelOutcome> {
  const title = await ports.promptForTitle();
  if (title === undefined) {
    return { kind: "cancelled" };
  }

  const config = ports.getCaptureConfig();
  const editorContext = ports.getActiveEditorContext();
  const { document, selection } = resolveDocumentAndSelection(config, editorContext);

  const evidenceChoice = await ports.promptForEvidenceChoice();
  const git = await resolveGitIdentity(ports, config, evidenceChoice?.includeGitIdentity ?? false);

  const evidence: EvidenceSelection = {};
  if (evidenceChoice?.includeSelectedText && editorContext.selectedText !== null) {
    evidence.selectedText = editorContext.selectedText;
  }

  const capturedAtUtc = ports.now();
  const environment = ports.getEnvironmentInfo();
  const input = {
    reportId: ports.generateReportId(),
    capturedAtUtc,
    title,
    environment,
    document,
    selection,
    git,
    evidence,
  };

  const diagnostics = validateBugReportInput(input);
  if (diagnostics.length > 0) {
    return { kind: "invalid", diagnostics };
  }

  const report = createBugReport(input);
  const markdown = renderBugReportMarkdown(report);
  const fileName = buildReportFileName({
    capturedAtUtc,
    extensionId: environment.extensionId,
    title: report.title,
  });
  const stored = await ports.saveReport(fileName, markdown);

  let openFailed = false;
  try {
    await ports.openReport(stored);
  } catch {
    openFailed = true;
  }

  return { kind: "saved", report, stored, openFailed };
}
