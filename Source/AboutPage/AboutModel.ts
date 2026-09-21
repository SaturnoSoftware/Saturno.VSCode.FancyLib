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
// File      : AboutModel.ts                                                  //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-21                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

/**
 * Two data models, and the line between them.
 *
 * AboutSpec is what an extension writes: a handful of literals, no URIs and
 * no HTML. AboutPageData is what the renderer consumes: every value already
 * resolved into a webview URI and ready to be escaped into the template.
 * AboutPanel.ts turns the first into the second, which is why an extension
 * never has to know that a webview URI is a different thing from a path.
 */

//
// WHAT AN EXTENSION DECLARES
//

/**
 * One product in the About panel's "More Software" grid.
 *
 * `iconFile` is a file name under the extension's own Resources/icons/, not
 * a path: a packaged extension can only serve webview resources from inside
 * itself, so every consumer ships its own copy of the icons it references.
 */
// -----------------------------------------------------------------------------
export interface AboutProduct {
  iconFile: string;
  name: string;
  description: string;
  repositoryUrl: string;
}

/** Everything that differs between one extension's About panel and another's. */
// -----------------------------------------------------------------------------
export interface AboutSpec {
  /** Used when package.json declares neither displayName nor name. */
  fallbackName: string;
  /** Used when package.json declares no description. */
  fallbackDescription: string;
  moreSoftware: AboutProduct[];
}

//
// WHAT THE RENDERER CONSUMES
//

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
  /** CSP nonce for the page's one inline <script>. */
  nonce: string;
}
