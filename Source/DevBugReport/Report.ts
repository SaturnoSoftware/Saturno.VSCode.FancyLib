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
// File      : Report.ts                                                      //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * VSCODEKIT-0018: the one place a BugReport is constructed and validated.
 * Pure - no vscode, no filesystem, no clock read (the caller supplies
 * `capturedAtUtc`), so every scenario in the adversarial review's "must fail
 * safely" list is a fixture here, not a manual click-through.
 */

import {
  BugReport,
  CreateBugReportInput,
  REPORT_SCHEMA_VERSION,
  ValidationDiagnostic,
} from "./Types";

// -----------------------------------------------------------------------------
const MAX_TITLE_LENGTH = 200;

// -----------------------------------------------------------------------------
export function validateBugReportInput(input: CreateBugReportInput): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];

  if (!input.reportId || input.reportId.trim().length === 0) {
    diagnostics.push({ field: "reportId", message: "reportId must be a non-empty string." });
  }
  const trimmedTitle = input.title.trim();
  if (trimmedTitle.length === 0) {
    diagnostics.push({ field: "title", message: "title must not be empty or whitespace-only." });
  } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    diagnostics.push({
      field: "title",
      message: `title must be at most ${MAX_TITLE_LENGTH} characters (got ${trimmedTitle.length}).`,
    });
  }
  if (!Number.isFinite(input.capturedAtUtc.getTime())) {
    diagnostics.push({ field: "capturedAtUtc", message: "capturedAtUtc must be a valid Date." });
  }
  if (!input.environment.extensionId || input.environment.extensionId.trim().length === 0) {
    diagnostics.push({ field: "environment.extensionId", message: "extensionId must be a non-empty string." });
  }

  return diagnostics;
}

/**
 * Throws only on a programmer error (see validateBugReportInput for the
 * user-facing diagnostics an adapter should check first). Trims the title
 * so a value that is only whitespace-different from another does not
 * produce a different-looking but functionally duplicate report.
 */
// -----------------------------------------------------------------------------
export function createBugReport(input: CreateBugReportInput): BugReport {
  const diagnostics = validateBugReportInput(input);
  if (diagnostics.length > 0) {
    throw new Error(
      `createBugReport: invalid input - ${diagnostics.map((d) => `${d.field}: ${d.message}`).join("; ")}`
    );
  }

  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    reportId: input.reportId,
    capturedAtUtc: input.capturedAtUtc.toISOString(),
    title: input.title.trim(),
    environment: input.environment,
    document: input.document,
    selection: input.selection,
    git: input.git,
    evidence: input.evidence ?? {},
  };
}
