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
// File      : LogUtils.ts                                                    //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

//
// Constants
//

// -----------------------------------------------------------------------------
const LOG_PREFIX = "[Saturno.VSCode.FancyLib]";

// -----------------------------------------------------------------------------
export function Error(message: string, error?: unknown): void {
  if (error === undefined) {
    console.error(`${LOG_PREFIX} ${message}`);
    return;
  }

  console.error(`${LOG_PREFIX} ${message}`, error);
}

// -----------------------------------------------------------------------------
export function Warn(message: string): void {
  console.warn(`${LOG_PREFIX} ${message}`);
}

// -----------------------------------------------------------------------------
export function Info(message: string): void {
  console.info(`${LOG_PREFIX} ${message}`);
}
