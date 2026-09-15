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
// Date      : 2026-05-19                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //

// -----------------------------------------------------------------------------
export { CommentSyntax } from "./Types";
export { getCommentSyntax, getCommentSyntaxForEditor } from "./CommentSyntax";
export { resolveCommentSyntaxFromComments } from "./CommentSyntaxCore";
export { getActiveEditor, getActiveFilePath, showError } from "./EditorUtils";
export { clamp, normalizeInteger, normalizeChar, normalizeStringArray } from "./Utils";
export { getConfigValue } from "./ConfigUtils";

// -----------------------------------------------------------------------------
export type { LanguageComments } from "./CommentSyntaxCore";

// -----------------------------------------------------------------------------
// VSCODEKIT-0018: the shared "Open Bug" development-only capability's pure
// domain. See DevBugReport/index.ts's own header for the full export list.
export * from "./DevBugReport";

// -----------------------------------------------------------------------------
// VSCODEKIT-0020: the Open Bug panel workflow orchestrated against injected
// ports - see DevBugReportPanel.ts's own header for why it lives outside
// DevBugReport/ despite never importing vscode itself.
export * from "./DevBugReportPanel";
