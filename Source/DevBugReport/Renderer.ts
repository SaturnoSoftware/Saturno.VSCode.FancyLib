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
// File      : Renderer.ts                                                    //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * VSCODEKIT-0018: deterministic Markdown rendering of a BugReport. Same
 * report in, same bytes out, every time - no timestamps, random ids or
 * locale-dependent formatting introduced here (those already live in the
 * report itself). Every field goes through MarkdownEscape.ts before it
 * reaches the output string.
 */

import { escapeInline, toFencedBlock } from "./MarkdownEscape";
import { sanitizeEvidence } from "./Redaction";
import { BugReport, Omittable, isOmitted } from "./Types";

/** `value.reason` is always one of the fixed OmissionReason string literals
 *  this module defines - not user-controlled data - so it is interpolated
 *  directly rather than through escapeInline, which would otherwise turn
 *  every underscore in a reason like `git_timed_out` into `git\_timed\_out`
 *  for no safety benefit. */
// -----------------------------------------------------------------------------
function renderOmittable<T>(value: Omittable<T>, renderPresent: (value: T) => string): string {
  if (isOmitted(value)) {
    return `_omitted (${value.reason})_`;
  }
  return renderPresent(value);
}

// -----------------------------------------------------------------------------
function renderDocument(document: BugReport["document"]): string {
  return renderOmittable(document, (doc) => {
    if ("untitled" in doc) {
      return `untitled document (\`${escapeInline(doc.languageId)}\`)`;
    }
    return `\`${escapeInline(doc.relativePath)}\` (\`${escapeInline(doc.languageId)}\`)`;
  });
}

// -----------------------------------------------------------------------------
function renderSelection(selection: BugReport["selection"]): string {
  return renderOmittable(selection, (sel) => {
    if (sel.isEmpty) {
      return `caret at line ${sel.start.line + 1}, column ${sel.start.character + 1}`;
    }
    return (
      `line ${sel.start.line + 1}, column ${sel.start.character + 1} ` +
      `to line ${sel.end.line + 1}, column ${sel.end.character + 1}`
    );
  });
}

// -----------------------------------------------------------------------------
function renderGit(git: BugReport["git"]): string {
  return renderOmittable(git, (identity) => `\`${escapeInline(identity.branch)}\` @ \`${escapeInline(identity.shortCommit)}\``);
}

// -----------------------------------------------------------------------------
export function renderBugReportMarkdown(report: BugReport): string {
  const lines: string[] = [];

  lines.push(`# ${escapeInline(report.title)}`);
  lines.push("");
  lines.push(`- **Report id:** \`${escapeInline(report.reportId)}\``);
  lines.push(`- **Captured (UTC):** ${escapeInline(report.capturedAtUtc)}`);
  lines.push(`- **Schema version:** ${report.schemaVersion}`);
  lines.push(`- **Extension:** \`${escapeInline(report.environment.extensionId)}\` ${escapeInline(report.environment.extensionVersion)}`);
  lines.push(`- **Build channel:** ${escapeInline(report.environment.buildChannel)}`);
  lines.push(`- **VS Code:** ${escapeInline(report.environment.vscodeVersion)} on ${escapeInline(report.environment.platform)}`);
  lines.push(`- **Document:** ${renderDocument(report.document)}`);
  lines.push(`- **Selection:** ${renderSelection(report.selection)}`);
  lines.push(`- **Git:** ${renderGit(report.git)}`);
  lines.push("");

  if (report.evidence.selectedText !== undefined) {
    lines.push("## Selected text");
    lines.push("");
    lines.push(toFencedBlock(sanitizeEvidence(report.evidence.selectedText)));
    lines.push("");
  }

  return lines.join("\n");
}
