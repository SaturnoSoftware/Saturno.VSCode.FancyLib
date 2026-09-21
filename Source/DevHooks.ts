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
// File      : DevHooks.ts                                                    //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-21                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

/**
 * The contract between an extension's always-shipped Extension.ts and its
 * development-only module in Source/dev/.
 *
 * This file is always compiled, in every build, because Extension.ts has to
 * describe what it would hand a dev module without knowing whether one
 * exists. Source/dev/ is excluded from tsconfig.prod.json, so in a
 * production build nothing implements DevModule, the guarded require in
 * Extension.ts throws, and the dev commands are never registered.
 *
 * Must not import "vscode": Extension.ts reaches this before it knows
 * whether a dev build is even running.
 */

// -----------------------------------------------------------------------------
export interface DevHost {
  extensionVersion: string;
}

/** The shape Source/dev/index.ts must export, for the guarded require. */
// -----------------------------------------------------------------------------
export interface DevModule {
  RegisterDevCommands(context: unknown, host: DevHost): void;
}
