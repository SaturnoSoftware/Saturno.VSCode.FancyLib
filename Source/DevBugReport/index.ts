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
// File      : index.ts                                                       //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

// -----------------------------------------------------------------------------
export { REPORT_SCHEMA_VERSION, isOmitted } from "./Types";
export { createBugReport, validateBugReportInput } from "./Report";
export { renderBugReportMarkdown } from "./Renderer";
export { MAX_EVIDENCE_LENGTH, TRUNCATION_MARKER, redactSecrets, sanitizeEvidence, truncateEvidence } from "./Redaction";
export { escapeInline, fenceForContent, toFencedBlock } from "./MarkdownEscape";
export { buildReportFileName, formatTimestampForFileName, slugify } from "./FileName";
export {
  DestinationRefusedError,
  buildOpenableUri,
  reserveReportFile,
  resolveDestinationDirectory,
} from "./Storage";

// -----------------------------------------------------------------------------
export type {
  BuildChannel,
  BugReport,
  CreateBugReportInput,
  CursorPosition,
  DocumentReference,
  EditorDocumentReference,
  EnvironmentInfo,
  EvidenceSelection,
  GitIdentity,
  Omittable,
  OmissionReason,
  Omitted,
  SelectionRange,
  UntitledDocumentReference,
  ValidationDiagnostic,
} from "./Types";
export type { StoredReport } from "./Storage";
