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
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-21                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

// The About domain: the data models, the pure renderer, and the vscode panel
// that connects them. An extension normally needs only ShowAboutPanel and
// AboutSpec; the rest is exported for tests.
// -----------------------------------------------------------------------------
export * from "./AboutModel";
export * from "./RenderAboutPage";
export * from "./AboutPanel";
