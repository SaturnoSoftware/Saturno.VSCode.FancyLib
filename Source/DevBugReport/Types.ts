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
// File      : Types.ts                                                       //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * VSCODEKIT-0018: the pure domain for the shared "Open Bug" development-only
 * capability. Metadata-only by default, local-only, never a Tasker/Brain/
 * network client - see _SATURNO_BRAIN/CONTEXT/REPO/SATURNO.VSCODEKIT/
 * sessions/2026/09/2026-09-15-development-bug-reporting-grooming.md.
 *
 * This file and its siblings in DevBugReport/ must never import "vscode",
 * "fs", "child_process" or "http"/"https" - packageContract.test.ts and this
 * module's own tests enforce that boundary from both directions.
 */

// -----------------------------------------------------------------------------
export const REPORT_SCHEMA_VERSION = 1 as const;

// -----------------------------------------------------------------------------
export type BuildChannel = "development" | "production";

// -----------------------------------------------------------------------------
export interface DocumentReference {
  /** Workspace-relative path (POSIX separators), never an absolute path. */
  relativePath: string;
  languageId: string;
}

// -----------------------------------------------------------------------------
export interface UntitledDocumentReference {
  untitled: true;
  languageId: string;
}

// -----------------------------------------------------------------------------
export type EditorDocumentReference = DocumentReference | UntitledDocumentReference;

// -----------------------------------------------------------------------------
export interface CursorPosition {
  line: number;
  character: number;
}

// -----------------------------------------------------------------------------
export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
  /** True when start === end - a caret, not a highlighted range. */
  isEmpty: boolean;
}

/**
 * A field the adapter tried to collect but could not - the FBR-07 contract:
 * a slow or absent Git query, no active editor, or an unavailable workspace
 * become a typed, renderable omission instead of blocking report creation
 * or silently leaving the field out.
 */
// -----------------------------------------------------------------------------
export type OmissionReason =
  | "no_active_editor"
  | "no_workspace"
  | "git_unavailable"
  | "git_timed_out"
  | "git_error"
  | "not_requested";

// -----------------------------------------------------------------------------
export interface Omitted {
  omitted: true;
  reason: OmissionReason;
}

// -----------------------------------------------------------------------------
export type Omittable<T> = T | Omitted;

// -----------------------------------------------------------------------------
export function isOmitted<T>(value: Omittable<T>): value is Omitted {
  return typeof value === "object" && value !== null && (value as Omitted).omitted === true;
}

/**
 * FBR-10: Git identity only - branch name and short commit. Never a diff,
 * never file contents, never a full log. Absent entirely unless the user
 * opts in (see EvidenceSelection.includeGitIdentity).
 */
// -----------------------------------------------------------------------------
export interface GitIdentity {
  branch: string;
  shortCommit: string;
}

/**
 * FBR-01/FBR-06: what the user explicitly chose to attach, beyond metadata.
 * Every field here defaults to absent - the panel adapter must set one only
 * after describing to the user what will be saved.
 */
// -----------------------------------------------------------------------------
export interface EvidenceSelection {
  /** Raw text the user explicitly selected to attach (e.g. the current
   *  selection). Redacted and truncated by the renderer, never verbatim. */
  selectedText?: string;
  includeGitIdentity?: boolean;
}

// -----------------------------------------------------------------------------
export interface EnvironmentInfo {
  extensionId: string;
  extensionVersion: string;
  buildChannel: BuildChannel;
  vscodeVersion: string;
  platform: string;
}

/**
 * The immutable, versioned report. Constructing one never touches vscode,
 * the filesystem or the network - see createBugReport in Report.ts.
 */
// -----------------------------------------------------------------------------
export interface BugReport {
  schemaVersion: typeof REPORT_SCHEMA_VERSION;
  reportId: string;
  capturedAtUtc: string;
  title: string;
  environment: EnvironmentInfo;
  document: Omittable<EditorDocumentReference>;
  selection: Omittable<SelectionRange>;
  git: Omittable<GitIdentity>;
  evidence: EvidenceSelection;
}

// -----------------------------------------------------------------------------
export interface ValidationDiagnostic {
  field: string;
  message: string;
}

// -----------------------------------------------------------------------------
export interface CreateBugReportInput {
  reportId: string;
  capturedAtUtc: Date;
  title: string;
  environment: EnvironmentInfo;
  document: Omittable<EditorDocumentReference>;
  selection: Omittable<SelectionRange>;
  git: Omittable<GitIdentity>;
  evidence?: EvidenceSelection;
}
