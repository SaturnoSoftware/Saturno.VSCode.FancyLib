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
// File      : AppCard.ts                                                     //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import { EscapeHtml } from "../Utils";
import { RenderIconButton } from "./IconButton";
import { AppCardModel } from "./Types";

// -----------------------------------------------------------------------------
export type AppCardVariant = "publisher" | "tool";

/**
 * Renders one app entry - icon, name, description and a row of link
 * buttons. Same component in both sizes: "publisher" is the bigger
 * Saturno Software card, "tool" is a "More Software" grid entry, which
 * normally carries fewer links (see the mock comment "same of the above
 * but with less icons and such").
 */
// -----------------------------------------------------------------------------
export function RenderAppCard(model: AppCardModel, variant: AppCardVariant): string {
  const card_class = variant === "publisher" ? "card app-card app-card-publisher" : "card app-card app-card-tool";
  const icon_class = variant === "publisher" ? "app-card-logo" : "app-card-icon";
  const links_html = model.Links.map(RenderIconButton).join("");

  return (
    `<section class="${card_class}">` +
    `<img class="${icon_class}" src="${EscapeHtml(model.IconUri)}" alt="${EscapeHtml(model.IconAlt)}">` +
    `<div class="app-card-text">` +
    `<span class="app-card-name">${EscapeHtml(model.Name)}</span>` +
    `<span class="app-card-desc muted">${EscapeHtml(model.Description)}</span>` +
    `</div>` +
    (model.Links.length > 0 ? `<div class="app-card-links">${links_html}</div>` : "") +
    `</section>`
  );
}
