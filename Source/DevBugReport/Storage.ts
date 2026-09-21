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
// File      : Storage.ts                                                     //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * The local file sink for a rendered BugReport. Takes a
 * default directory (the caller resolves that from a vscode
 * ExtensionContext's global storage - this module never imports "vscode"
 * or talks to Tasker/Brain) and an optional user-configured directory,
 * refuses anything that is not an absolute, normalized path under an
 * expected root, and writes with exclusive file creation so two reports
 * captured close together never silently overwrite each other.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// -----------------------------------------------------------------------------
export class DestinationRefusedError extends Error {
  constructor(public readonly reason: string) {
    super(`bug report destination refused: ${reason}`);
    this.name = "DestinationRefusedError";
  }
}

/** The default directory is trusted as-is - it comes from the extension's
 *  own global storage, not user input. A configured override must be an
 *  absolute path and must resolve inside one of the expected roots, so a
 *  relative path or a `..` escape cannot redirect a report anywhere on
 *  disk. */
// -----------------------------------------------------------------------------
export function resolveDestinationDirectory(options: {
  defaultDirectory: string;
  configuredDirectory?: string;
  expectedRoots: readonly string[];
}): string {
  const { defaultDirectory, configuredDirectory, expectedRoots } = options;
  if (configuredDirectory === undefined) {
    return path.normalize(defaultDirectory);
  }
  if (!path.isAbsolute(configuredDirectory)) {
    throw new DestinationRefusedError(`configured directory is not absolute: ${configuredDirectory}`);
  }
  const normalized = path.normalize(configuredDirectory);
  const isInsideAnExpectedRoot = expectedRoots.some((root) => {
    const normalizedRoot = path.normalize(root);
    const relative = path.relative(normalizedRoot, normalized);
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  });
  if (!isInsideAnExpectedRoot) {
    throw new DestinationRefusedError(`configured directory is outside every expected root: ${configuredDirectory}`);
  }
  return normalized;
}

// -----------------------------------------------------------------------------
export interface StoredReport {
  readonly path: string;
  readonly uri: string;
}

/** file:// percent-encodes everything except the path separators and the
 *  small set of characters RFC 3986 allows unescaped - Windows drive-letter
 *  colons and backslashes are normalized to forward slashes first. */
// -----------------------------------------------------------------------------
export function buildOpenableUri(filePath: string): string {
  const posixPath = filePath.split(path.sep).join("/");
  const withLeadingSlash = posixPath.startsWith("/") ? posixPath : `/${posixPath}`;
  const encoded = withLeadingSlash
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `file://${encoded}`;
}

const _MAX_COLLISION_ATTEMPTS = 1000;

/** Exclusive creation ("wx") means the write itself fails on a name that
 *  already exists rather than silently truncating another report - the
 *  numeric suffix loop only ever adds a new, previously-unseen name. */
// -----------------------------------------------------------------------------
export function reserveReportFile(directory: string, fileName: string, content: string): StoredReport {
  fs.mkdirSync(directory, { recursive: true });
  const extension = path.extname(fileName);
  const stem = fileName.slice(0, fileName.length - extension.length);

  for (let attempt = 0; attempt < _MAX_COLLISION_ATTEMPTS; attempt++) {
    const candidateName = attempt === 0 ? fileName : `${stem}-${attempt}${extension}`;
    const candidatePath = path.join(directory, candidateName);
    try {
      fs.writeFileSync(candidatePath, content, { encoding: "utf8", flag: "wx" });
      return { path: candidatePath, uri: buildOpenableUri(candidatePath) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
  }
  throw new DestinationRefusedError(`could not reserve a unique file name for: ${fileName}`);
}
