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
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

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
