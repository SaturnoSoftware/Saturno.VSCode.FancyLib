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
// File      : MarkdownEscape.ts                                              //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * VSCODEKIT-0018 / FBR-08: every field value the renderer inserts into the
 * report goes through one of these two functions - a hostile title (Markdown
 * delimiters, a fenced-code-block terminator, control characters) must not
 * be able to corrupt the report's own structure.
 */

/** For a value that appears inline in a Markdown line (a title, a field
 *  value in a `**Label:** value` line). Escapes the characters that would
 *  otherwise be interpreted as Markdown syntax, and strips control
 *  characters and newlines - inline fields are always single-line. */
// -----------------------------------------------------------------------------
export function escapeInline(value: string): string {
  const noControlChars = stripControlCharacters(value);
  const singleLine = noControlChars.replace(/\r\n|\r|\n/g, " ");
  return singleLine.replace(/[\\`*_{}[\]()#+\-.!|<>]/g, (char) => `\\${char}`);
}

/**
 * For a multi-line value placed inside a fenced code block. A code fence's
 * only structural risk is the fence delimiter itself appearing in the
 * content and prematurely closing the block - widen the fence instead of
 * escaping the body, which is the standard Markdown technique and keeps the
 * body byte-identical (modulo control-character stripping) for a reader.
 */
// -----------------------------------------------------------------------------
export function fenceForContent(content: string): string {
  const runs = content.match(/`+/g) ?? [];
  const longestRun = runs.reduce((max, run) => Math.max(max, run.length), 0);
  return "`".repeat(Math.max(3, longestRun + 1));
}

// -----------------------------------------------------------------------------
export function toFencedBlock(content: string, languageHint: string = ""): string {
  const clean = stripControlCharacters(content);
  const fence = fenceForContent(clean);
  return `${fence}${languageHint}\n${clean}\n${fence}`;
}

/**
 * Removes ASCII control characters so a report can never carry an invisible
 * payload - tab (9), newline (10) and carriage return (13) are left alone;
 * callers decide separately whether those are allowed in a given context.
 * Built from character codes rather than a regex control-character class,
 * so nothing here depends on a literal control byte surviving file I/O.
 */
// -----------------------------------------------------------------------------
function stripControlCharacters(value: string): string {
  let result = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    const isControl = (code >= 0 && code <= 31 && !isAllowedWhitespace) || code === 127;
    if (!isControl) {
      result += value[i];
    }
  }
  return result;
}
