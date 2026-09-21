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
// File      : DevCommands.ts                                                 //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-21                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

/**
 * The vscode wiring for the development-only Open Bug command.
 *
 * DevBugReportPanel.ts holds the workflow and takes every capability it
 * needs as an injected port, so that it never imports "vscode". This file is
 * the other side of that seam: it implements those ports against the real
 * editor, and it is the only part of the Open Bug feature that touches the
 * extension host.
 *
 * Reachable only through Source/Debug, which tsconfig.prod.json excludes, so
 * none of this is compiled into a production build.
 */

// -----------------------------------------------------------------------------
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import * as path from "node:path";
import * as vscode from "vscode";
// -----------------------------------------------------------------------------
import { DevHost } from "../DevHooks";
import {
  DevBugReportCaptureConfig,
  DevBugReportPanelPorts,
  ActiveEditorContext,
  EvidenceChoice,
  GitIdentityAttempt,
  runOpenBugPanel,
} from "../DevBugReportPanel";
import { reserveReportFile, resolveDestinationDirectory } from "../DevBugReport";

//
// CONSTANTS
//

const GIT_IDENTITY_TIMEOUT_MS = 2000;
const SELECTED_TEXT_CHOICE = "Attach the selected text (or current line)";
const GIT_IDENTITY_CHOICE = "Attach the current Git branch and commit";

//
// WHAT AN EXTENSION DECLARES
//

/** Everything that differs between one extension's dev commands and another's. */
// -----------------------------------------------------------------------------
export interface DevCommandsSpec {
  /** The extension's settings section, which also prefixes its command ids. */
  configSection: string;
  /** Marketplace identity, recorded in the report and in its file name. */
  extensionId: string;
  /** The `when` key that reveals the dev commands in the command palette. */
  devModeContextKey: string;
  /** An example bug title, shown greyed out in the input box. */
  bugTitlePlaceholder: string;
}

//
// REGISTRATION
//

/** Called from an extension's Source/dev/index.ts, and from nowhere else. */
// -----------------------------------------------------------------------------
export function RegisterDevCommands(
  context: unknown,
  host: DevHost,
  spec: DevCommandsSpec
): void {
  const ctx = context as vscode.ExtensionContext;

  void vscode.commands.executeCommand("setContext", spec.devModeContextKey, true);
  ctx.subscriptions.push(
    vscode.commands.registerCommand(`${spec.configSection}.dev.reportBug`, () =>
      _ReportBug(ctx, host, spec)
    )
  );
}

// -----------------------------------------------------------------------------
async function _ReportBug(
  context: vscode.ExtensionContext,
  host: DevHost,
  spec: DevCommandsSpec
): Promise<void> {
  const outcome = await runOpenBugPanel(_BuildPorts(context, host, spec));

  switch (outcome.kind) {
    case "cancelled":
      return;
    case "invalid":
      void vscode.window.showWarningMessage(
        `${spec.configSection} dev: ${outcome.diagnostics.map((d) => d.message).join(" ")}`
      );
      return;
    case "saved":
      void vscode.window.setStatusBarMessage(
        `Saturno bug report saved${outcome.openFailed ? ` (could not reopen it: ${outcome.stored.path})` : ""}`,
        6000
      );
      return;
  }
}

//
// PORTS
//

// -----------------------------------------------------------------------------
function _BuildPorts(
  context: vscode.ExtensionContext,
  host: DevHost,
  spec: DevCommandsSpec
): DevBugReportPanelPorts {
  return {
    promptForTitle: () =>
      Promise.resolve(
        vscode.window.showInputBox({
          title: "Saturno bug report",
          prompt: "One line: what is wrong?",
          placeHolder: spec.bugTitlePlaceholder,
          ignoreFocusOut: true,
        })
      ),
    promptForEvidenceChoice: _PromptForEvidenceChoice,
    getActiveEditorContext: _GetActiveEditorContext,
    getGitIdentity: (timeoutMs: number) => {
      const editor = vscode.window.activeTextEditor;
      const cwd = editor
        ? path.dirname(editor.document.uri.fsPath)
        : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      return cwd
        ? _GetGitIdentity(cwd, timeoutMs)
        : Promise.resolve<GitIdentityAttempt>({ outcome: "unavailable" });
    },
    getEnvironmentInfo: () => ({
      extensionId: spec.extensionId,
      extensionVersion: host.extensionVersion,
      buildChannel: "development",
      vscodeVersion: vscode.version,
      platform: process.platform,
    }),
    getCaptureConfig: (): DevBugReportCaptureConfig => ({
      captureDocument: true,
      captureSelection: true,
      gitIdentityTimeoutMs: GIT_IDENTITY_TIMEOUT_MS,
    }),
    generateReportId: () => randomUUID(),
    now: () => new Date(),
    saveReport: (fileName, markdown) => {
      const directory = resolveDestinationDirectory({
        defaultDirectory: context.globalStorageUri.fsPath,
        expectedRoots: [context.globalStorageUri.fsPath],
      });
      return Promise.resolve(reserveReportFile(directory, fileName, markdown));
    },
    openReport: async (stored) => {
      const opened = await vscode.workspace.openTextDocument(vscode.Uri.file(stored.path));
      await vscode.window.showTextDocument(opened, { preview: false });
    },
  };
}

// -----------------------------------------------------------------------------
function _GetActiveEditorContext(): ActiveEditorContext {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return { document: null, selection: null, selectedText: null };
  }

  const doc = editor.document;
  const document = doc.isUntitled
    ? { untitled: true as const, languageId: doc.languageId }
    : { relativePath: vscode.workspace.asRelativePath(doc.uri, false), languageId: doc.languageId };

  const sel = editor.selection;
  const selection = {
    start: { line: sel.start.line, character: sel.start.character },
    end: { line: sel.end.line, character: sel.end.character },
    isEmpty: sel.isEmpty,
  };

  return { document, selection, selectedText: sel.isEmpty ? null : doc.getText(sel) };
}

/**
 * One multi-select QuickPick for both evidence choices, dismissible with
 * Escape. The caller treats "nothing picked" the same whether the user
 * dismissed the prompt or picked nothing on purpose.
 */
// -----------------------------------------------------------------------------
async function _PromptForEvidenceChoice(): Promise<EvidenceChoice | undefined> {
  const picked = await vscode.window.showQuickPick([SELECTED_TEXT_CHOICE, GIT_IDENTITY_CHOICE], {
    canPickMany: true,
    title: "Saturno bug report: optional evidence",
    placeHolder: "Nothing is attached beyond safe metadata unless you pick it here",
    ignoreFocusOut: true,
  });

  if (picked === undefined) {
    return undefined;
  }

  return {
    includeSelectedText: picked.includes(SELECTED_TEXT_CHOICE),
    includeGitIdentity: picked.includes(GIT_IDENTITY_CHOICE),
  };
}

/**
 * Never runs synchronously on the UI path: bounded by a timeout race, and a
 * missing `git` binary or a non-repository directory degrade to a typed
 * outcome instead of throwing.
 */
// -----------------------------------------------------------------------------
async function _GetGitIdentity(cwd: string, timeoutMs: number): Promise<GitIdentityAttempt> {
  const run = (args: string[]): Promise<string> =>
    new Promise((resolve, reject) => {
      execFile("git", args, { cwd, encoding: "utf8" }, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("git query timed out")), timeoutMs);
  });

  try {
    const [branch, shortCommit] = await Promise.race([
      Promise.all([run(["rev-parse", "--abbrev-ref", "HEAD"]), run(["rev-parse", "--short", "HEAD"])]),
      timeout,
    ]);
    return { outcome: "found", identity: { branch, shortCommit } };
  } catch (error) {
    if (error instanceof Error && error.message === "git query timed out") {
      return { outcome: "timed_out" };
    }
    if ((error as NodeJS.ErrnoException | undefined)?.code === "ENOENT") {
      return { outcome: "unavailable" };
    }
    return { outcome: "error" };
  }
}
