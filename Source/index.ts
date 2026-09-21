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
// Date      : 2026-05-19                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //

// One-stop barrel: a consumer does `import * as Fancy from ".../FancyLib/Source"`
// and reaches every domain as `Fancy.EditorUtils.X()`, `Fancy.GitUtils.X()`, etc.
// -----------------------------------------------------------------------------
export * as ConfigUtils from "./ConfigUtils";
export * as EditorUtils from "./EditorUtils";
export * as CommentUtils from "./CommentUtils";
export * as CommentDetection from "./CommentDetection";
export * as FileUtils from "./FileUtils";
export * as GitUtils from "./GitUtils";
export * as DateUtils from "./DateUtils";
export * as OSUtils from "./OSUtils";
export * as LogUtils from "./LogUtils";
export * as Utils from "./Utils";
export * as AboutPage from "./AboutPage/RenderAboutPage";

// -----------------------------------------------------------------------------
// VSCODEKIT-0026: what is deliberately NOT here.
//
// The development-only Open Bug domain (DevBugReport, DevBugReportPanel) used
// to be re-exported from this file. A static re-export is a static
// dependency, so TypeScript compiled it into every consumer's production
// build - a store artifact carrying a bug-reporting domain it had no command
// to invoke. It now lives behind its own entry point: a dev-only module
// imports ".../FancyLib/Source/Debug", and tsconfig.prod.json excludes that
// module, so a production build cannot reach it. See Debug/index.ts.
//
// BuildIsolation is likewise absent on purpose: it is the contract a
// consumer's own acceptance test checks a real build against, so it is
// imported directly from "./BuildIsolation" by that test and has no business
// in the runtime barrel.
