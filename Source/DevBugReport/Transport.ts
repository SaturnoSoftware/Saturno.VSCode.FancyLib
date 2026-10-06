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
// File      : Transport.ts                                                   //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-16                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * The seam a future Saturno bug backend will plug into -
 * without enabling submission today. The current release writes only a
 * local report file (Storage.ts / DevBugReportPanel.ts); nothing in this
 * module, or anywhere else in DevBugReport/, ever calls a transport.
 *
 * `BugReport` (Types.ts) carries no token, endpoint or credential field -
 * a transport that needs one supplies it from its own configuration, never
 * from the domain. This file stays in DevBugReport/ precisely because a
 * transport contract is domain-level: no vscode, no filesystem, no network
 * import, so a real implementation (HTTP, a queue, anything) lives entirely
 * outside FancyLib and is handed in by the caller.
 */

import { BugReport } from "./Types";

// -----------------------------------------------------------------------------
export type TransportResult = { outcome: "sent" } | { outcome: "declined"; reason: string };

/**
 * `dispatch` is never called by the panel today - the panel's
 * DevBugReportPanelPorts has no transport slot. This interface exists so a
 * future port CAN be added there without redesigning the domain: whatever
 * calls `dispatch` is also the only thing that decided the user explicitly
 * asked for a submission, since no code path here invokes it on its own.
 */
// -----------------------------------------------------------------------------
export interface BugReportTransport {
  dispatch(report: BugReport): Promise<TransportResult>;
}

/**
 * The only transport this release ships: it never performs network I/O and
 * always declines. A future real transport is a separate implementation of
 * `BugReportTransport` supplied by whatever wires up the panel - this
 * function is not a placeholder to fill in later, it is what "no dispatch
 * enabled" looks like as code.
 */
// -----------------------------------------------------------------------------
export function disabledBugReportTransport(): BugReportTransport {
  return {
    dispatch: (_report: BugReport) =>
      Promise.resolve<TransportResult>({
        outcome: "declined",
        reason: "no bug-report transport is enabled in this release; the report was saved locally only",
      }),
  };
}
