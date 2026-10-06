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
// File      : CommentDetection.ts                                            //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

// The VS Code side of comment-syntax lookup: reads a language's comment
// configuration from the active extensions. Split out of CommentUtils.ts so
// that file's pure resolver stays loadable outside the extension host.

// -----------------------------------------------------------------------------
import * as path from "path";
import * as JSON5 from "json5";
import * as vscode from "vscode";
// -----------------------------------------------------------------------------
import * as FileUtils from "./FileUtils";
import * as LogUtils from "./LogUtils";
import { CommentSyntax, LanguageComments, _ResolveCommentSyntaxFromComments } from "./CommentUtils";

// -----------------------------------------------------------------------------
export function GetCommentSyntax(languageId: string): CommentSyntax | null {
  const comments = GetLanguageComments(languageId);
  const syntax = _ResolveCommentSyntaxFromComments(comments);
  if (!syntax) {
    LogUtils.Error(`Unsupported comment configuration for language "${languageId}"`);
    return null;
  }

  return syntax;
}

// -----------------------------------------------------------------------------
export function GetCommentSyntaxForEditor(editor: vscode.TextEditor): CommentSyntax | null {
  return GetCommentSyntax(editor.document.languageId);
}

// -----------------------------------------------------------------------------
interface VSCodeLanguageContribution {
  id: string;
  configuration?: string;
}

// -----------------------------------------------------------------------------
export function GetLanguageComments(languageId: string): LanguageComments | null {
  for (const ext of vscode.extensions.all) {
    const contributes = ext.packageJSON?.contributes;
    if (!contributes?.languages) {
      continue;
    }

    const languages: VSCodeLanguageContribution[] = contributes.languages;
    const lang_def = languages.find((l) => l.id === languageId);

    if (!lang_def?.configuration) {
      continue;
    }

    const config_path = path.join(ext.extensionPath, lang_def.configuration);
    if (!FileUtils.ExistsSync(config_path)) {
      continue;
    }

    const raw_config = FileUtils.ReadAllText(config_path);
    if (raw_config === null) {
      continue;
    }

    const config = JSON5.parse(raw_config);
    if (config?.comments) {
      return config.comments as LanguageComments;
    }
  }

  return null;
}
