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
// File      : FileUtils.ts                                                   //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-20                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

// -----------------------------------------------------------------------------
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
// -----------------------------------------------------------------------------
import * as DateUtils from "./DateUtils";
import * as LogUtils from "./LogUtils";
import * as GitUtils from "./GitUtils";

// -----------------------------------------------------------------------------
export function ExistsSync(path: string) {
  return fs.existsSync(path);
}

// -----------------------------------------------------------------------------
export function ReadAllText(filePath: string | undefined): string | null {
  if (!filePath) {
    return null;
  }

  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
export function MakeDirsRecursive(dirpath: string)
{
  fs.mkdirSync(dirpath, { recursive: true });
}

// -----------------------------------------------------------------------------
export function WriteAllText(filepath: string, contents: string)
{
  fs.writeFileSync(filepath, `${contents}\n`, "utf8");

}
// -----------------------------------------------------------------------------
export function GetDefaultUserAppRoot(
  appName: string,
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
  homeDirectory: string = os.homedir(),
): string {
  if (platform === "win32") {
    const appData = env.APPDATA ?? path.join(homeDirectory, "AppData", "Roaming");
    return path.win32.join(appData, "Code", "User", appName);
  }

  if (platform === "darwin") {
    return path.posix.join(homeDirectory, "Library", "Application Support", "Code", "User", appName);
  }

  return path.posix.join(homeDirectory, ".config", "Code", "User", appName);
}


// -----------------------------------------------------------------------------
export function ResolveFileDate(filePath: string): Date {
  return GetInitialFileDate(filePath) ?? GetFileCreationDate(filePath) ?? new Date();
}


// -----------------------------------------------------------------------------
export function GetLastGitModifiedDate(gitRoot: string, filePath: string): Date | null {
  const relativeFilePath = path.relative(gitRoot, filePath);
  const output = GitUtils.RunGit(gitRoot, ["log", "-1", "--format=%cs", "--", relativeFilePath]);
  const dateText = output?.trim();
  return dateText ? DateUtils.ParseDate(dateText) : null;
}

// -----------------------------------------------------------------------------
export function GetFileModificationDate(filePath: string): Date | null {
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
export function GetInitialFileDate(filePath: string): Date | null {
  const output = GitUtils.RunGit(path.dirname(filePath), [
    "log",
    "--follow",
    "--format=%ad",
    "--date=format:%Y-%m-%d",
    "--reverse",
    "--",
    filePath,
  ]);

  if (!output) {
    return null;
  }

  const firstLine = output.split(/\r?\n/, 1)[0]?.trim();
  if (!firstLine) {
    return null;
  }

  return DateUtils.ParseDate(firstLine);
}

// -----------------------------------------------------------------------------
export function GetFileCreationDate(filePath: string): Date | null {
  try {
    return fs.statSync(filePath).birthtime;
  } catch (error) {
    LogUtils.Error(`Failed to read file creation date for "${filePath}".`, error);
    return null;
  }
}

// -----------------------------------------------------------------------------
export function ResolveLastModifiedDate(
  filePath: string,
  gitRoot: string | null,
  getGitModifiedDate: (root: string, targetFilePath: string) => Date | null = GetLastGitModifiedDate,
  getFileModifiedDate: (targetFilePath: string) => Date | null = GetFileModificationDate
): Date {
  return (gitRoot ? getGitModifiedDate(gitRoot, filePath) : null)
    ?? getFileModifiedDate(filePath)
    ?? new Date();
}
