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
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

import { EscapeHtml } from "../Utils";
import { RenderAppCard } from "./AppCard";
import { RenderHeaderCard } from "./HeaderCard";
import { AboutPageModel } from "./Types";

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
