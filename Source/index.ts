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
// Project   : Saturno.FancyLib                                              //
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
