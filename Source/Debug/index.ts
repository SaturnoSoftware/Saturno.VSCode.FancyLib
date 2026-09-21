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

/**
 * The development-only half of FancyLib, behind its own entry point.
 *
 * The Open Bug domain used to be re-exported from Source/index.ts, the
 * barrel every extension imports for its runtime helpers. A static
 * re-export is a static dependency: TypeScript compiled DevBugReport and
 * DevBugReportPanel into every consumer's PRODUCTION build, because the
 * barrel reaches them whether or not anything calls them. The store
 * artifact carried a bug-reporting domain it had no command to invoke.
 *
 * Splitting the entry point is what actually fixes it. A consumer's
 * production path imports ".../FancyLib/Source" and reaches none of this;
 * only its dev-only module imports ".../FancyLib/Source/Debug", and that
 * module is excluded from tsconfig.prod.json. One import line decides it,
 * which is the property a build-isolation rule needs: visible at the
 * import, not buried in a transitive graph.
 */

// The pure domain: report construction, redaction, markdown, storage.
// -----------------------------------------------------------------------------
export * from "../DevBugReport";

// The panel workflow, orchestrated against injected ports - it never
// imports "vscode" itself, which is why it lives outside this directory.
// -----------------------------------------------------------------------------
export * from "../DevBugReportPanel";

// The vscode wiring that implements those ports and registers the command.
// -----------------------------------------------------------------------------
export * from "./DevCommands";
