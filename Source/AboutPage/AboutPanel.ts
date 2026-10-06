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
// File      : AboutPanel.ts                                                  //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-21                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// License   : GPLv3                                                          //
// -------------------------------------------------------------------------- //

/**
 * The whole About panel: open the webview, read the template off disk,
 * resolve every URI through the webview, render, and handle the one message
 * the page can send back.
 *
 * This is the half that needs "vscode", because only a vscode.Webview can
 * turn a file path into a URI the page is allowed to load. An extension
 * supplies an AboutSpec - a few literals - and nothing else; everything that
 * is the same for every Saturno extension lives here.
 */

// -----------------------------------------------------------------------------
import * as crypto from "crypto";
import * as vscode from "vscode";
// -----------------------------------------------------------------------------
import { AboutApp, AboutPageData, AboutSpec } from "./AboutModel";
import { RenderAboutPage } from "./RenderAboutPage";

//
// CONSTANTS
//

/**
 * Where the template lives once a build has staged it, and where it lives in
 * the repository before any build has run.
 *
 * about.html and about.css are checked in once, here in FancyLib, and
 * Scripts/build.ps1 copies them into each extension's own Resources/ - a
 * packaged extension can only serve webview resources from inside itself.
 * That copy does not exist in a working tree, so pressing F5 and running the
 * About command used to fail with file-not-found; falling back to the
 * submodule's own source path is what makes the command work unbuilt.
 */
// -----------------------------------------------------------------------------
const STAGED_ASSET_SEGMENTS = ["Resources", "AboutPage"];
const SOURCE_ASSET_SEGMENTS = ["Libraries", "Saturno.VSCode.FancyLib", "Source", "AboutPage"];

// -----------------------------------------------------------------------------
const PUBLISHER_CARD: AboutApp = {
  iconUri: "",
  iconAlt: "Saturno Software",
  name: "Saturno Software",
  description: "Discover Saturno Software solutions",
  links: [
    { href: "https://github.com/SaturnoSoftware", label: "GitHub", glyph: "github" },
    { href: "https://saturno.software", label: "Website", glyph: "website" },
  ],
};

// -----------------------------------------------------------------------------
const CHANGELOG_BUTTON_LABEL = "View Changelog";

//
// COMMAND
//

/** The body of every Saturno extension's `about` command. */
// -----------------------------------------------------------------------------
export async function ShowAboutPanel(
  context: vscode.ExtensionContext,
  spec: AboutSpec
): Promise<void> {
  const asset_uri = await _ResolveAssetDirectory(context);
  const panel = vscode.window.createWebviewPanel(
    `${context.extension.id}.about`,
    `About ${_ReadManifest(context, spec).name}`,
    vscode.ViewColumn.Active,
    {
      enableFindWidget: false,
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "Resources"), asset_uri],
    }
  );

  panel.webview.html = await _RenderPanelHtml(panel.webview, context, spec, asset_uri);

  panel.webview.onDidReceiveMessage(async (message: { command?: string }) => {
    if (message?.command === "openChangelog") {
      await _OpenChangelog(context);
    }
  });
}

//
// ASSETS
//

// -----------------------------------------------------------------------------
async function _ResolveAssetDirectory(context: vscode.ExtensionContext): Promise<vscode.Uri> {
  const staged = vscode.Uri.joinPath(context.extensionUri, ...STAGED_ASSET_SEGMENTS);
  return (await _Exists(vscode.Uri.joinPath(staged, "about.html")))
    ? staged
    : vscode.Uri.joinPath(context.extensionUri, ...SOURCE_ASSET_SEGMENTS);
}

// -----------------------------------------------------------------------------
async function _Exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
async function _RenderPanelHtml(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  spec: AboutSpec,
  assetUri: vscode.Uri
): Promise<string> {
  const template_bytes = await vscode.workspace.fs.readFile(
    vscode.Uri.joinPath(assetUri, "about.html")
  );

  return RenderAboutPage(Buffer.from(template_bytes).toString("utf8"), {
    cspSource: webview.cspSource,
    styleUri: webview.asWebviewUri(vscode.Uri.joinPath(assetUri, "about.css")).toString(),
    nonce: crypto.randomBytes(16).toString("base64"),
    ..._BuildPageData(webview, context, spec),
  });
}

//
// DATA
//

// -----------------------------------------------------------------------------
interface ManifestFacts {
  name: string;
  description: string;
  version: string;
  build: string;
}

// -----------------------------------------------------------------------------
function _ReadManifest(context: vscode.ExtensionContext, spec: AboutSpec): ManifestFacts {
  const manifest = context.extension.packageJSON as {
    displayName?: string;
    name?: string;
    description?: string;
    version?: string;
    build?: string | number;
  };

  return {
    name: _OrFallback(manifest.displayName ?? manifest.name, spec.fallbackName),
    description: _OrFallback(manifest.description, spec.fallbackDescription),
    version: _OrFallback(manifest.version, "unknown"),
    build: _OrFallback(manifest.build === undefined ? "" : String(manifest.build), "unknown"),
  };
}

/**
 * The publisher card links to GitHub and the Saturno Software website only -
 * a deliberately smaller set than the five social icons of the original
 * design, since a VS Code About panel is a developer surface, not a
 * marketing one.
 */
// -----------------------------------------------------------------------------
function _BuildPageData(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  spec: AboutSpec
): Omit<AboutPageData, "cspSource" | "styleUri" | "nonce"> {
  const manifest = _ReadManifest(context, spec);
  const icon_uri = (fileName: string) =>
    webview
      .asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "Resources", "icons", fileName))
      .toString();

  return {
    extensionName: manifest.name,
    header: {
      iconUri: icon_uri("icon.png"),
      iconAlt: manifest.name,
      name: manifest.name,
      description: manifest.description,
      version: manifest.version,
      build: manifest.build,
      legal: `Copyright ${new Date().getFullYear()} Saturno Software. All rights reserved.`,
    },
    publisher: { ...PUBLISHER_CARD, iconUri: icon_uri("saturno-software.png") },
    moreSoftware: spec.moreSoftware.map((product) => ({
      iconUri: icon_uri(product.iconFile),
      iconAlt: product.name,
      name: product.name,
      description: product.description,
      links: [{ href: product.repositoryUrl, label: "GitHub", glyph: "github" as const }],
    })),
    changelogButtonLabel: CHANGELOG_BUTTON_LABEL,
  };
}

//
// HELPERS
//

// -----------------------------------------------------------------------------
async function _OpenChangelog(context: vscode.ExtensionContext): Promise<void> {
  const changelog_uri = vscode.Uri.joinPath(context.extensionUri, "CHANGELOG.md");
  const document = await vscode.workspace.openTextDocument(changelog_uri);
  await vscode.window.showTextDocument(document, { preview: false });
}

// -----------------------------------------------------------------------------
function _OrFallback(value: string | undefined, fallback: string): string {
  return value !== undefined && value.trim().length > 0 ? value : fallback;
}
