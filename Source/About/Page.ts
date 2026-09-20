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
// File      : Page.ts                                                        //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import { EscapeHtml } from "../Utils";
import { RenderAppCard } from "./AppCard";
import { RenderHeaderCard } from "./HeaderCard";
import { AboutPageModel } from "./Types";

/**
 * Assembles the full About body: header card, publisher card and a
 * "More Software" grid - the `<main>` content of the AltTilda About mock,
 * data-driven instead of hand-written per extension.
 */
// -----------------------------------------------------------------------------
export function RenderAboutPage(model: AboutPageModel): string {
  const more_software_html = model.MoreSoftware.map((app) => RenderAppCard(app, "tool")).join("");

  return (
    `<main><div class="col">` +
    RenderHeaderCard(model.Header) +
    RenderAppCard(model.Publisher, "publisher") +
    `<h2>More Software</h2>` +
    `<div class="grid">${more_software_html}</div>` +
    `<button class="changelog-button" type="button" data-command="openChangelog">` +
    `${EscapeHtml(model.ChangelogButtonLabel)}</button>` +
    `</div></main>`
  );
}
