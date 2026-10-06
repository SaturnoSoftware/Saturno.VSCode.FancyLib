import { describe, it } from "node:test";
import * as assert from "node:assert";
import { RenderAboutPage } from "../Source/AboutPage/RenderAboutPage";
import { AboutPageData } from "../Source/AboutPage/AboutModel";

const TEMPLATE =
  '<html><head><meta content="style-src {{cspSource}}; script-src \'nonce-{{nonce}}\';">' +
  "<link href=\"{{styleUri}}\"><title>About {{extensionName}}</title></head><body>" +
  '<img src="{{headerIconUri}}" alt="{{headerIconAlt}}"><h1>{{headerName}}</h1>' +
  "<p>{{headerDescription}}</p><span>Version {{headerVersion}} - Build {{headerBuild}}</span>" +
  "<span>{{headerLegal}}</span>" +
  '<img src="{{publisherIconUri}}" alt="{{publisherIconAlt}}"><span>{{publisherName}}</span>' +
  "<span>{{publisherDescription}}</span><div>{{publisherLinksHtml}}</div>" +
  "<div class=\"grid\">{{moreSoftwareHtml}}</div>" +
  '<button data-command="openChangelog">{{changelogButtonLabel}}</button>' +
  '<script nonce="{{nonce}}"></script></body></html>';

function buildData(overrides: Partial<AboutPageData> = {}): AboutPageData {
  return {
    cspSource: "vscode-webview://abc",
    styleUri: "vscode-webview://abc/about.css",
    extensionName: "Saturno FancyHeader",
    nonce: "n0nce",
    header: {
      iconUri: "Resources/icons/icon.png",
      iconAlt: "Saturno FancyHeader",
      name: "Saturno FancyHeader",
      description: "Standardize your file headers with reusable templates.",
      version: "2.4.0",
      build: "31",
      legal: "Copyright 2026 Saturno Software. All rights reserved.",
    },
    publisher: {
      iconUri: "Resources/icons/saturno-software.png",
      iconAlt: "Saturno Software",
      name: "Saturno Software",
      description: "Discover Saturno Software solutions",
      links: [{ href: "https://github.com/SaturnoSoftware", label: "GitHub", glyph: "github" }],
    },
    moreSoftware: [
      {
        iconUri: "Resources/icons/gosh.webp",
        iconAlt: "Gosh",
        name: "Gosh",
        description: "Bookmarks for your shell.",
        links: [{ href: "https://github.com/SaturnoSoftware/gosh", label: "GitHub", glyph: "github" }],
      },
    ],
    changelogButtonLabel: "View Changelog",
    ...overrides,
  };
}

describe("renderAboutPage", () => {
  it("fills every token with the model's data", () => {
    const html = RenderAboutPage(TEMPLATE, buildData());
    assert.match(html, /<h1>Saturno FancyHeader<\/h1>/);
    assert.match(html, /Version 2\.4\.0 - Build 31/);
    assert.match(html, /Copyright 2026 Saturno Software\. All rights reserved\./);
    assert.match(html, /View Changelog/);
    assert.match(html, /script-src 'nonce-n0nce';/);
    assert.match(html, /<script nonce="n0nce">/);
  });

  it("leaves no unresolved {{token}} in the output", () => {
    const html = RenderAboutPage(TEMPLATE, buildData());
    assert.doesNotMatch(html, /\{\{[a-zA-Z]+\}\}/);
  });

  it("escapes untrusted header/publisher text", () => {
    const data = buildData();
    data.header.name = '<script>1</script>';
    data.publisher.description = '"><b>x</b>';
    const html = RenderAboutPage(TEMPLATE, data);
    assert.doesNotMatch(html, /<script>1<\/script>/);
    assert.match(html, /&lt;script&gt;1&lt;\/script&gt;/);
    assert.match(html, /&quot;&gt;&lt;b&gt;x&lt;\/b&gt;/);
  });

  it("renders one link button per link, github and website glyphs included", () => {
    const data = buildData({ moreSoftware: [] });
    data.publisher.links = [
      { href: "https://github.com/SaturnoSoftware", label: "GitHub", glyph: "github" },
      { href: "https://saturno.software", label: "Website", glyph: "website" },
    ];
    const html = RenderAboutPage(TEMPLATE, data);
    assert.strictEqual((html.match(/link-btn/g) ?? []).length, 2);
  });

  it("omits the links row for a tool card with no links", () => {
    const data = buildData();
    data.moreSoftware = [{ ...data.moreSoftware[0], links: [] }];
    const html = RenderAboutPage(TEMPLATE, data);
    assert.doesNotMatch(html, /app-card-links/);
  });

  it("renders an empty grid when there is no software to list", () => {
    const html = RenderAboutPage(TEMPLATE, buildData({ moreSoftware: [] }));
    assert.match(html, /<div class="grid"><\/div>/);
  });
});
