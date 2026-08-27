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
// File      : CommentSyntax.ts                                               //
// Project   : Saturno.VSCodeKit                                              //
// Date      : 2026-05-19                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //

import * as fs from "fs";
import * as path from "path";
import * as JSON5 from "json5";
import * as vscode from "vscode";
import { CommentSyntax } from "./Types";
import { LanguageComments, resolveCommentSyntaxFromComments } from "./CommentSyntaxCore";

export { CommentSyntax };

// -----------------------------------------------------------------------------
export function getCommentSyntax(languageId: string): CommentSyntax | null {
  const comments = getLanguageComments(languageId);
  const syntax = resolveCommentSyntaxFromComments(comments);
  if (!syntax) {
    console.error(`[Saturno.VSCodeKit] Unsupported comment configuration for language "${languageId}"`);
    return null;
  }

  return syntax;
}

// -----------------------------------------------------------------------------
export function getCommentSyntaxForEditor(editor: vscode.TextEditor): CommentSyntax | null {
  return getCommentSyntax(editor.document.languageId);
}

// -----------------------------------------------------------------------------
function getLanguageComments(languageId: string): LanguageComments | null {
  for (const ext of vscode.extensions.all) {
    const contributes = ext.packageJSON?.contributes;
    if (!contributes?.languages) {
      continue;
    }

    const languages: any[] = contributes.languages;
    const langDef = languages.find((l: any) => l.id === languageId);

    if (!langDef?.configuration) {
      continue;
    }

    const configPath = path.join(ext.extensionPath, langDef.configuration);
    if (!fs.existsSync(configPath)) {
      continue;
    }

    const config = JSON5.parse(fs.readFileSync(configPath, "utf8"));
    if (config?.comments) {
      return config.comments as LanguageComments;
    }
  }

  return null;
}
