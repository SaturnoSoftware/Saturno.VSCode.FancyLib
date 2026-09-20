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
// File      : Types.ts                                                       //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

// A glyph name rather than raw markup: IconButton owns the trusted SVG
// source for each name, so a caller can never inject arbitrary markup
// through a model built from extension metadata.
// -----------------------------------------------------------------------------
export type IconGlyphName = "github" | "website";

// -----------------------------------------------------------------------------
export interface IconLinkModel {
  Href: string;
  Label: string;
  Glyph: IconGlyphName;
}

// -----------------------------------------------------------------------------
export interface AppCardModel {
  IconUri: string;
  IconAlt: string;
  Name: string;
  Description: string;
  Links: IconLinkModel[];
}

// -----------------------------------------------------------------------------
export interface AboutHeaderModel {
  IconUri: string;
  IconAlt: string;
  Name: string;
  Description: string;
  Version: string;
  Build: string;
  Legal: string;
}

// -----------------------------------------------------------------------------
export interface AboutPageModel {
  Header: AboutHeaderModel;
  Publisher: AppCardModel;
  MoreSoftware: AppCardModel[];
  ChangelogButtonLabel: string;
}
