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
// File      : GitUtils.ts                                                    //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

// -----------------------------------------------------------------------------
import * as childProcess from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
// -----------------------------------------------------------------------------
import * as DateUtils from "./DateUtils"

//
// Interface
//

// -----------------------------------------------------------------------------
export interface GitUserInfo {
  name: string;
  email: string;
}

//
// Functions
//

// -----------------------------------------------------------------------------
export function RunGit(cwd: string, args: string[]): string | null {
  try {
    return childProcess.execFileSync(
      "git",
      ["-C", cwd, ...args],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
export function GetGitUserInfoFromCommand(gitRoot: string | null): GitUserInfo | null {
  if (!gitRoot) {
    return null;
  }

  const name = RunGit(gitRoot, ["config", "user.name"]) ?? "";
  const email = RunGit(gitRoot, ["config", "user.email"]) ?? "";

  if (!name && !email) {
    return null;
  }

  return { name, email };
}



// -----------------------------------------------------------------------------
export function RunGitAsync(cwd: string, args: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    childProcess.execFile("git", ["-C", cwd, ...args], { encoding: "utf8", windowsHide: true }, (error, stdout) => {
      resolve(error ? null : stdout.trim());
    });
  });
}

// -----------------------------------------------------------------------------
export async function GetLastGitModifiedDateAsync(gitRoot: string, filePath: string): Promise<Date | null> {
  const relativeFilePath = path.relative(gitRoot, filePath);
  const output = await RunGitAsync(gitRoot, ["log", "-1", "--format=%cs", "--", relativeFilePath]);
  return output ? DateUtils.ParseDate(output.trim()) : null;
}

// -----------------------------------------------------------------------------
export function GetGitConfigPath(gitRoot: string): string | null {
  const gitDirectory = ResolveGitDirectory(gitRoot);
  if (!gitDirectory) {
    return null;
  }

  return path.join(gitDirectory, "config");
}

// -----------------------------------------------------------------------------
export function ResolveGitDirectory(gitRoot: string): string | null {
  const gitMarkerPath = path.join(gitRoot, ".git");

  try {
    const stats = fs.statSync(gitMarkerPath);
    if (stats.isDirectory()) {
      return gitMarkerPath;
    }

    if (!stats.isFile()) {
      return null;
    }
  } catch {
    return null;
  }

  let pointerFile: string;
  try {
    pointerFile = fs.readFileSync(gitMarkerPath, "utf8");
  } catch {
    return null;
  }

  const match = pointerFile.match(/^\s*gitdir:\s*(.+)\s*$/im);
  if (!match) {
    return null;
  }

  const resolvedGitDirectory = path.resolve(gitRoot, match[1].trim());

  try {
    return fs.statSync(resolvedGitDirectory).isDirectory() ? resolvedGitDirectory : null;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
export function ReadGitUserInfoFromConfigFile(configPath: string): GitUserInfo | null {
  let contents: string;
  try {
    contents = fs.readFileSync(configPath, "utf8");
  } catch {
    return null;
  }

  let currentSection = "";
  let name = "";
  let email = "";

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) {
      continue;
    }

    const sectionMatch = rawLine.match(/^\s*\[([^\]]+)\]\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim().split(/\s+/, 1)[0]?.toLowerCase() ?? "";
      continue;
    }

    if (currentSection !== "user") {
      continue;
    }

    const entryMatch = rawLine.match(/^\s*([A-Za-z][A-Za-z0-9-]*)\s*=\s*(.*?)\s*$/);
    if (!entryMatch) {
      continue;
    }

    const key = entryMatch[1].toLowerCase();
    const value = NormalizeGitConfigValue(entryMatch[2]);
    if (key === "name") {
      name = value;
      continue;
    }

    if (key === "email") {
      email = value;
    }
  }

  if (!name && !email) {
    return null;
  }

  return { name, email };
}

// -----------------------------------------------------------------------------
export function ReadGitUserInfoFromConfigFiles(
  gitRoot: string | null,
  homeDirectory: string = os.homedir()
): GitUserInfo | null {
  const global_user = ReadGitUserInfoFromConfigFile(path.join(homeDirectory, ".gitconfig"));
  const local_config_path = gitRoot ? GetGitConfigPath(gitRoot) : null;
  const local_user = local_config_path ? ReadGitUserInfoFromConfigFile(local_config_path) : null;
  const name = local_user?.name?.trim() || global_user?.name?.trim() || "";
  const email = local_user?.email?.trim() || global_user?.email?.trim() || "";

  if (!name && !email) {
    return null;
  }

  return { name, email };
}

// -----------------------------------------------------------------------------
function NormalizeGitConfigValue(value: string): string {
  const trimmed = value.trim();
  const has_double_quotes = trimmed.startsWith("\"") && trimmed.endsWith("\"");
  const has_single_quotes = trimmed.startsWith("'") && trimmed.endsWith("'");

  if (trimmed.length >= 2 && (has_double_quotes || has_single_quotes)) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

// -----------------------------------------------------------------------------
export function GetGitRoot(filePath: string): string | null {
  return FindGitRootFromFilePath(filePath) ?? RunGit(path.dirname(filePath), ["rev-parse", "--show-toplevel"]);
}

// -----------------------------------------------------------------------------
export function GetGitUserInfo(gitRoot: string | null): GitUserInfo | null {
  return GetGitUserInfoFromCommand(gitRoot) ?? ReadGitUserInfoFromConfigFiles(gitRoot);
}


// -----------------------------------------------------------------------------
export function FindGitRootFromFilePath(filePath: string): string | null {
  let currentDirectory = path.dirname(path.resolve(filePath));
  const temporaryRoot = path.resolve(os.tmpdir());

  while (currentDirectory !== temporaryRoot && !fs.existsSync(path.join(currentDirectory, ".git"))) {

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return null;
    }

    currentDirectory = parentDirectory;
  }

  return currentDirectory === temporaryRoot ? null : currentDirectory;
}
