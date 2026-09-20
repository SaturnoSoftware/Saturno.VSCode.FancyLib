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
// File      : IconButton.ts                                                  //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

import { EscapeHtml } from "../Utils";
import { IconGlyphName, IconLinkModel } from "./Types";

// currentColor SVGs instead of light/dark PNG pairs: a VS Code webview's
// actual theme is the editor theme, not the OS light/dark preference the
// original mockup toggled on - `fill`/`stroke: currentColor` tracks
// `--vscode-foreground` automatically, in every theme, with one glyph.
// -----------------------------------------------------------------------------
const _GLYPHS: Record<IconGlyphName, string> = {
  github:
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 ' +
    '0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78' +
    '-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3' +
    '-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 ' +
    '1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 ' +
    '3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825' +
    '.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
  website:
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 12h18M12 3c2.4 2.4 3.8 5.6 3.8 9s-1.4 6.6' +
    '-3.8 9c-2.4-2.4-3.8-5.6-3.8-9s1.4-6.6 3.8-9z"/></svg>',
};

/**
 * Renders a small square link button carrying one glyph, matching the
 * `.link-btn` shape from the AltTilda About mock (see PROJECTBUILDER
 * artifact "AltTilda About - Mock", comment "iconbutton components").
 */
// -----------------------------------------------------------------------------
export function RenderIconButton(link: IconLinkModel): string {
  const label = EscapeHtml(link.Label);
  return (
    `<a class="link-btn" href="${EscapeHtml(link.Href)}" aria-label="${label}" title="${label}">` +
    `${_GLYPHS[link.Glyph]}</a>`
  );
}
