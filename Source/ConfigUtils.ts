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
// File      : ConfigUtils.ts                                                 //
// Project   : Saturno.FancyLib                                               //
// Date      : 2026-09-01                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //

import * as vscode from "vscode";

/**
 * Gets a configuration value from VS Code workspace settings.
 * This is a type-safe wrapper around vscode.workspace.getConfiguration().get().
 */

// -----------------------------------------------------------------------------
export function getConfigValue<T>(
  configSection: string,
  key: string,
  defaultValue: T
): T {
  return vscode.workspace.getConfiguration(configSection).get<T>(key, defaultValue);
}
