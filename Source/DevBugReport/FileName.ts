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
// File      : FileName.ts                                                    //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * `<utc>-<extension-id>-<title>.md`, normalized so a hostile
 * title (path separators, control characters, leading dots) cannot escape
 * the intended directory or collide with a reserved name on Windows.
 */

// -----------------------------------------------------------------------------
const MAX_TITLE_SLUG_LENGTH = 60;

// -----------------------------------------------------------------------------
const WINDOWS_RESERVED_NAMES = new Set([
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
]);

/** UTC timestamp formatted for a filename: no colons, no punctuation the
 *  filesystem could choke on. `2026-09-15T18:04:03.123Z` becomes
 *  `20260915T180403Z` - second resolution is enough to make a collision
 *  between two genuinely distinct reports rare, and FileReservation.ts
 *  is what actually prevents overwriting one. */
// -----------------------------------------------------------------------------
export function formatTimestampForFileName(date: Date): string {
  const iso = date.toISOString();
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Lowercase, ASCII alphanumeric and hyphen only, collapsed and trimmed -
 *  the same normalization applied to both the extension id and the title,
 *  so neither can smuggle a path separator or reserved character through. */
// -----------------------------------------------------------------------------
export function slugify(value: string, maxLength: number = MAX_TITLE_SLUG_LENGTH): string {
  // Deliberately keeps only printable-and-below ASCII (\x00-\x7F), stripping
  // every non-ASCII codepoint left after NFKD decomposition.
  // eslint-disable-next-line no-control-regex
  const ascii = value.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  const slug = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const truncated = slug.slice(0, maxLength).replace(/-+$/, "");
  return truncated.length > 0 ? truncated : "untitled";
}

// -----------------------------------------------------------------------------
export function buildReportFileName(params: {
  capturedAtUtc: Date;
  extensionId: string;
  title: string;
}): string {
  const timestamp = formatTimestampForFileName(params.capturedAtUtc);
  const extensionSlug = slugify(params.extensionId, 40);
  const titleSlug = slugify(params.title);
  const candidate = `${timestamp}-${extensionSlug}-${titleSlug}`;
  const safe = WINDOWS_RESERVED_NAMES.has(candidate.toUpperCase()) ? `${candidate}-report` : candidate;
  return `${safe}.md`;
}
