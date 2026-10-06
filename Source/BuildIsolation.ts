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
// File      : BuildIsolation.ts                                              //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //


/**
 * The build-channel isolation contract every FancyLib
 * consumer's production-artifact acceptance test checks against. A build
 * script (e.g. a consumer's Scripts/build.ps1) is what actually strips dev
 * content from a production package.json and excludes dev sources from
 * compilation - this module is the independent check that the result is
 * really clean, so the stripping logic and the check that verifies it are
 * never the same code path.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// -----------------------------------------------------------------------------
export interface BuildChannelIsolationContract {
  /** Matched against a command id (`contributes.commands[].command` and
   *  every `contributes.menus[...][].command`). */
  devCommandIdPattern: RegExp;
  /** Matched against a configuration property key
   *  (`contributes.configuration.properties`). */
  devConfigurationKeyPattern: RegExp;
  /** Matched against a POSIX-normalized path relative to the output
   *  directory root. */
  devOutputPathPattern: RegExp;
}

/** The `.dev.` infix convention already in use for FancyAlign's command ids
 *  (`saturno-fancy-align.dev.reportBug`) and configuration keys
 *  (`saturno-fancy-align.dev.brainPath`), plus a `dev/` output directory
 *  segment for compiled dev-only modules (`Sources/dev/` -> `out/dev/`). */
// -----------------------------------------------------------------------------
export function defaultBuildChannelIsolationContract(): BuildChannelIsolationContract {
  return {
    devCommandIdPattern: /\.dev\./,
    devConfigurationKeyPattern: /\.dev\./,
    devOutputPathPattern: /(^|[/\\])dev([/\\]|$)/,
  };
}

// -----------------------------------------------------------------------------
export interface BuildIsolationViolation {
  kind: "command" | "menu" | "configuration" | "output-file";
  detail: string;
}

// -----------------------------------------------------------------------------
interface PackageManifestLike {
  contributes?: {
    commands?: Array<{ command?: string }>;
    menus?: Record<string, Array<{ command?: string }> | undefined>;
    configuration?: { properties?: Record<string, unknown> };
  };
}

/** Only the entries a build script actually rewrote per-channel are in
 *  scope here - a hand-authored, always-present menu group is left alone
 *  even if this scan runs over it, because it never matches the dev
 *  pattern in the first place. */
// -----------------------------------------------------------------------------
export function findManifestViolations(
  manifest: PackageManifestLike,
  contract: BuildChannelIsolationContract
): BuildIsolationViolation[] {
  const violations: BuildIsolationViolation[] = [];
  const contributes = manifest.contributes ?? {};

  for (const command of contributes.commands ?? []) {
    if (command.command !== undefined && contract.devCommandIdPattern.test(command.command)) {
      violations.push({ kind: "command", detail: command.command });
    }
  }

  for (const [menuId, entries] of Object.entries(contributes.menus ?? {})) {
    for (const entry of entries ?? []) {
      if (entry.command !== undefined && contract.devCommandIdPattern.test(entry.command)) {
        violations.push({ kind: "menu", detail: `${menuId}: ${entry.command}` });
      }
    }
  }

  for (const key of Object.keys(contributes.configuration?.properties ?? {})) {
    if (contract.devConfigurationKeyPattern.test(key)) {
      violations.push({ kind: "configuration", detail: key });
    }
  }

  return violations;
}

// -----------------------------------------------------------------------------
function listFilesRecursively(directory: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursively(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

// -----------------------------------------------------------------------------
export function findOutputViolations(
  outputDirectory: string,
  contract: BuildChannelIsolationContract
): BuildIsolationViolation[] {
  const violations: BuildIsolationViolation[] = [];
  for (const filePath of listFilesRecursively(outputDirectory)) {
    const relative = path.relative(outputDirectory, filePath).split(path.sep).join("/");
    if (contract.devOutputPathPattern.test(relative)) {
      violations.push({ kind: "output-file", detail: relative });
    }
  }
  return violations;
}

/** The single call a consumer's production-acceptance test makes: point it
 *  at the manifest a production build produced and the directory that
 *  build emitted, get back an empty array when the channel is genuinely
 *  clean. */
// -----------------------------------------------------------------------------
export function assertProductionBuildIsolation(options: {
  packageJsonPath: string;
  outputDirectory: string;
  contract?: BuildChannelIsolationContract;
}): BuildIsolationViolation[] {
  const contract = options.contract ?? defaultBuildChannelIsolationContract();
  const manifest = JSON.parse(fs.readFileSync(options.packageJsonPath, "utf8")) as PackageManifestLike;
  return [
    ...findManifestViolations(manifest, contract),
    ...findOutputViolations(options.outputDirectory, contract),
  ];
}
