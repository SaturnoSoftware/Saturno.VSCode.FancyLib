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
 * VSCODEKIT-0026. Until 2026-09-21 the Open Bug domain was re-exported from
 * Source/index.ts, the barrel every extension imports for its runtime
 * helpers. A static re-export is a static dependency: TypeScript compiled
 * DevBugReport and DevBugReportPanel into every consumer's PRODUCTION build,
 * because the barrel reaches them whether or not anything calls them. The
 * store artifact carried a bug-reporting domain it had no command to invoke,
 * and VSCODEKIT-0021's isolation contract had to be weakened to stay green.
 *
 * Splitting the entry point is what actually fixes it. A consumer's
 * production path imports ".../FancyLib/Source" and reaches none of this;
 * only its dev-only module imports ".../FancyLib/Source/Debug", and that
 * module is excluded from tsconfig.prod.json, so nothing here is ever
 * compiled into a store build. One import line decides it, which is the
 * property a build-isolation rule needs: visible at the import, not buried
 * in a transitive graph.
 *
 * Nothing new lives here. This file only re-exports what already existed, so
 * the split costs consumers a single changed import path.
 */

// -----------------------------------------------------------------------------
// VSCODEKIT-0018: the shared "Open Bug" development-only capability's pure
// domain. See DevBugReport/index.ts's own header for the full export list.
export * from "../DevBugReport";

// -----------------------------------------------------------------------------
// VSCODEKIT-0020: the Open Bug panel workflow orchestrated against injected
// ports - see DevBugReportPanel.ts's own header for why it lives outside
// DevBugReport/ despite never importing vscode itself.
export * from "../DevBugReportPanel";
