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
// VSCODEKIT-0018: the shared "Open Bug" development-only capability's pure
// domain. See DevBugReport/index.ts's own header for the full export list.
export * from "./DevBugReport";

// -----------------------------------------------------------------------------
// VSCODEKIT-0020: the Open Bug panel workflow orchestrated against injected
// ports - see DevBugReportPanel.ts's own header for why it lives outside
// DevBugReport/ despite never importing vscode itself.
export * from "./DevBugReportPanel";

// -----------------------------------------------------------------------------
// VSCODEKIT-0021: the build-channel isolation contract every consumer's own
// production-artifact acceptance test checks a real build against.
export * from "./BuildIsolation";
