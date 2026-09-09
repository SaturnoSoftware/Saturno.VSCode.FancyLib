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
// File      : CommentSyntaxCore.ts                                           //
// Project   : Saturno.FancyLib                                              //
// Date      : 2026-05-28                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import { CommentSyntax } from "./Types";

// -----------------------------------------------------------------------------
export interface LanguageComments {
  lineComment?: string;
  blockComment?: [string, string];
}

// -----------------------------------------------------------------------------
export function resolveCommentSyntaxFromComments(
  comments: LanguageComments | null | undefined
): CommentSyntax | null {
  if (!comments) {
    return null;
  }

  if (comments.lineComment) {
    const lineComment = comments.lineComment;
    return {
      singleLineStart: lineComment,
      singleLineEnd: "",
      multiLineStart: lineComment,
      multiLineMiddle: lineComment,
      multiLineEnd: lineComment,
    };
  }

  if (comments.blockComment) {
    const [open, close] = comments.blockComment;
    return {
      singleLineStart: open,
      singleLineEnd: close,
      multiLineStart: open,
      multiLineMiddle: open[open.length - 1] ?? open,
      multiLineEnd: close,
    };
  }

  return null;
}
