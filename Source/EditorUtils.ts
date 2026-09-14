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
// File      : EditorUtils.ts                                                 //
// Project   : Saturno.FancyLib                                              //
// Date      : 2026-05-19                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //

import * as vscode from "vscode";

// -----------------------------------------------------------------------------
export function getActiveEditor(): vscode.TextEditor | undefined {
  return vscode.window.activeTextEditor;
}

// -----------------------------------------------------------------------------
export function getActiveFilePath(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }
  return editor.document.uri.fsPath;
}

// -----------------------------------------------------------------------------
export function showError(message: string): void {
  vscode.window.showErrorMessage(message);
}
