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
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-05-19                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

// -----------------------------------------------------------------------------
import * as vscode from "vscode";


// -----------------------------------------------------------------------------
export function GetActiveEditor(): vscode.TextEditor | undefined {
  return vscode.window.activeTextEditor;
}

// -----------------------------------------------------------------------------
export function GetActiveFilePath(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }
  return editor.document.uri.fsPath;
}

// -----------------------------------------------------------------------------
export function GetActiveWorkspace(): vscode.WorkspaceFolder | undefined {
  const editor = GetActiveEditor();
  if (!editor) {
    return undefined;
  }

  return vscode.workspace.getWorkspaceFolder(editor.document.uri);
}

// -----------------------------------------------------------------------------
export function GetActiveWorkspaceFolderPath(): string | null {
  const workspace = GetActiveWorkspace();
  return workspace?.uri.fsPath ?? null;
}

//
// ERROR
//

// -----------------------------------------------------------------------------
export function ShowError(appName: string, message: string): void {
  // @TODO: Add more logging to the vscode outputs so we can see it in the logs and such
  vscode.window.showErrorMessage(`${appName}: ${message}`);
}

// -----------------------------------------------------------------------------
export function ShowInfo(appName: string, message: string): void {
  // @TODO: Add more logging to the vscode outputs so we can see it in the logs and such
  vscode.window.showInformationMessage(`${appName}: ${message}`);
}



//
// OPEN
//

// -----------------------------------------------------------------------------
export async function OpenFileInVSCode(filepath: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filepath));
  await vscode.window.showTextDocument(document, { preview: false });
}



//
// Pickers
//

// -----------------------------------------------------------------------------
export async function ShowInputBox(prompt: string, placeholder: string): Promise<string | undefined> {
  const input = await vscode.window.showInputBox({
    prompt,
    placeHolder: placeholder,
    ignoreFocusOut: true,
    validateInput: (value) => value.trim().length === 0 ? `${prompt} is required.` : undefined,
  });

  return input?.trim();
}


// -----------------------------------------------------------------------------
export async function ShowQuickPick<T extends vscode.QuickPickItem>(
  candidates: T[],
  placeHolder: string
): Promise<T | undefined> {
  return vscode.window.showQuickPick(
    candidates,
    {
      placeHolder,
      ignoreFocusOut: true,
    }
  );
}