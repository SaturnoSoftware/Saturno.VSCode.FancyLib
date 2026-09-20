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
// File      : HeaderCard.ts                                                  //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import { EscapeHtml } from "../Utils";
import { AboutHeaderModel } from "./Types";

/**
 * Renders the About page identity block - icon, product name,
 * description, version/build and copyright line. Matches the mock's
 * "AltTilda" hero (comment "header components").
 */
// -----------------------------------------------------------------------------
export function RenderHeaderCard(model: AboutHeaderModel): string {
  return (
    `<section class="card header-card">` +
    `<img class="header-card-icon" src="${EscapeHtml(model.IconUri)}" alt="${EscapeHtml(model.IconAlt)}">` +
    `<h1>${EscapeHtml(model.Name)}</h1>` +
    `<p class="header-card-desc">${EscapeHtml(model.Description)}</p>` +
    `<span class="header-card-ver">Version ${EscapeHtml(model.Version)} - Build ${EscapeHtml(model.Build)}</span>` +
    `<span class="header-card-legal">${EscapeHtml(model.Legal)}</span>` +
    `</section>`
  );
}
