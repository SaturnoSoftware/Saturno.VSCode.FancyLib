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
// File      : RenderAboutPage.ts                                             //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

/**
 * One templating scheme for every Fancy extension's About panel: about.html
 * (the page shell + markup) and about.css (the look) are the checked-in
 * template; this file is the only code that turns a plain JSON data model
 * into the final HTML string. Nothing here reads a file or imports
 * "vscode" - the caller (each extension's own About.ts) owns loading
 * about.html's text and resolving webview URIs, since only it has a
 * vscode.Webview to resolve them through. Icons and product data always
 * come from the caller's model; this module owns no image assets.
 */

// -----------------------------------------------------------------------------
export type AboutGlyphName = "github" | "website";

// -----------------------------------------------------------------------------
export interface AboutIconLink {
  href: string;
  label: string;
  glyph: AboutGlyphName;
}

// -----------------------------------------------------------------------------
export interface AboutApp {
  iconUri: string;
  iconAlt: string;
  name: string;
  description: string;
  links: AboutIconLink[];
}

// -----------------------------------------------------------------------------
export interface AboutHeader {
  iconUri: string;
  iconAlt: string;
  name: string;
  description: string;
  version: string;
  build: string;
  legal: string;
}

// -----------------------------------------------------------------------------
export interface AboutPageData {
  cspSource: string;
  styleUri: string;
  extensionName: string;
  header: AboutHeader;
  publisher: AboutApp;
  moreSoftware: AboutApp[];
  changelogButtonLabel: string;
  /** Caller-supplied CSP nonce for the page's one inline <script>. */
  nonce: string;
}

// currentColor SVGs instead of light/dark image pairs: a VS Code webview's
// actual theme is the editor theme, so fill/stroke: currentColor tracks
// --vscode-foreground automatically, in every theme, with one glyph.
// -----------------------------------------------------------------------------
const _GLYPHS: Record<AboutGlyphName, string> = {
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

// -----------------------------------------------------------------------------
function _EscapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// -----------------------------------------------------------------------------
function _RenderIconLink(link: AboutIconLink): string {
  const label = _EscapeHtml(link.label);
  return (
    `<a class="link-btn" href="${_EscapeHtml(link.href)}" aria-label="${label}" title="${label}">` +
    `${_GLYPHS[link.glyph]}</a>`
  );
}

// -----------------------------------------------------------------------------
function _RenderToolCard(app: AboutApp): string {
  const links_html = app.links.map(_RenderIconLink).join("");
  return (
    `<section class="card app-card app-card-tool">` +
    `<img class="app-card-icon" src="${_EscapeHtml(app.iconUri)}" alt="${_EscapeHtml(app.iconAlt)}">` +
    `<div class="app-card-text">` +
    `<span class="app-card-name">${_EscapeHtml(app.name)}</span>` +
    `<span class="app-card-desc muted">${_EscapeHtml(app.description)}</span>` +
    `</div>` +
    (app.links.length > 0 ? `<div class="app-card-links">${links_html}</div>` : "") +
    `</section>`
  );
}

/**
 * Fills `templateHtml` (about.html's text, loaded by the caller) with
 * `data`. Always the same templating; only the data changes.
 */
// -----------------------------------------------------------------------------
export function RenderAboutPage(templateHtml: string, data: AboutPageData): string {
  const tokens: Record<string, string> = {
    cspSource: data.cspSource,
    nonce: data.nonce,
    styleUri: data.styleUri,
    extensionName: _EscapeHtml(data.extensionName),
    headerIconUri: _EscapeHtml(data.header.iconUri),
    headerIconAlt: _EscapeHtml(data.header.iconAlt),
    headerName: _EscapeHtml(data.header.name),
    headerDescription: _EscapeHtml(data.header.description),
    headerVersion: _EscapeHtml(data.header.version),
    headerBuild: _EscapeHtml(data.header.build),
    headerLegal: _EscapeHtml(data.header.legal),
    publisherIconUri: _EscapeHtml(data.publisher.iconUri),
    publisherIconAlt: _EscapeHtml(data.publisher.iconAlt),
    publisherName: _EscapeHtml(data.publisher.name),
    publisherDescription: _EscapeHtml(data.publisher.description),
    publisherLinksHtml: data.publisher.links.map(_RenderIconLink).join(""),
    moreSoftwareHtml: data.moreSoftware.map(_RenderToolCard).join(""),
    changelogButtonLabel: _EscapeHtml(data.changelogButtonLabel),
  };

  let html = templateHtml;
  for (const [key, value] of Object.entries(tokens)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  return html;
}
