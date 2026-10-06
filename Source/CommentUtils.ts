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
// File      : CommentUtils.ts                                                //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-05-19                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

// Pure comment-syntax logic only. Nothing here may import "vscode" - the VS
// Code lookup (GetLanguageComments/GetCommentSyntax/GetCommentSyntaxForEditor)
// lives in CommentDetection.ts instead, so this file stays loadable and
// testable under plain node --test.

//
// Interface
//

// -----------------------------------------------------------------------------
export interface CommentSyntax {
  singleLineStart: string;
  singleLineEnd: string;
  multiLineStart: string;
  multiLineMiddle: string;
  multiLineEnd: string;
}

// -----------------------------------------------------------------------------
export interface LanguageComments {
  lineComment?: string;
  blockComment?: [string, string];
}

// -----------------------------------------------------------------------------
export function _ResolveCommentSyntaxFromComments(
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
