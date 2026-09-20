import { describe, it } from "node:test";
import * as assert from "node:assert";
import { RenderIconButton } from "../Source/About/IconButton";
import { RenderAppCard } from "../Source/About/AppCard";
import { RenderHeaderCard } from "../Source/About/HeaderCard";
import { RenderAboutPage } from "../Source/About/Page";
import { AboutPageModel, AppCardModel } from "../Source/About/Types";

describe("renderIconButton", () => {
  it("renders an anchor carrying the href, label and the glyph's svg", () => {
    const html = RenderIconButton({ Href: "https://github.com/SaturnoSoftware", Label: "GitHub", Glyph: "github" });
    assert.match(html, /^<a class="link-btn" href="https:\/\/github\.com\/SaturnoSoftware" aria-label="GitHub" title="GitHub">/);
    assert.match(html, /<svg/);
    assert.match(html, /<\/a>$/);
  });

  it("escapes untrusted label and href content", () => {
    const html = RenderIconButton({ Href: '"><script>1</script>', Label: '<b>"x"</b>', Glyph: "website" });
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;b&gt;&quot;x&quot;&lt;\/b&gt;/);
  });
});

describe("renderAppCard", () => {
  const model: AppCardModel = {
    IconUri: "icons/gosh.webp",
    IconAlt: "Gosh",
    Name: "Gosh",
    Description: "Bookmarks for your shell.",
    Links: [{ Href: "https://github.com/SaturnoSoftware/gosh", Label: "GitHub", Glyph: "github" }],
  };

  it("uses the publisher variant's classes and logo slot", () => {
    const html = RenderAppCard(model, "publisher");
    assert.match(html, /class="card app-card app-card-publisher"/);
    assert.match(html, /class="app-card-logo"/);
  });

  it("uses the tool variant's classes and icon slot", () => {
    const html = RenderAppCard(model, "tool");
    assert.match(html, /class="card app-card app-card-tool"/);
    assert.match(html, /class="app-card-icon"/);
  });

  it("omits the links row entirely when there are no links", () => {
    const html = RenderAppCard({ ...model, Links: [] }, "tool");
    assert.doesNotMatch(html, /app-card-links/);
  });

  it("renders one link button per link", () => {
    const two_links_model: AppCardModel = {
      ...model,
      Links: [
        { Href: "https://github.com/SaturnoSoftware/gosh", Label: "GitHub", Glyph: "github" },
        { Href: "https://saturno.software", Label: "Website", Glyph: "website" },
      ],
    };
    const html = RenderAppCard(two_links_model, "publisher");
    assert.strictEqual((html.match(/link-btn/g) ?? []).length, 2);
  });
});

describe("renderHeaderCard", () => {
  it("renders name, description, version/build and legal line", () => {
    const html = RenderHeaderCard({
      IconUri: "Resources/images/icon.png",
      IconAlt: "Saturno FancyHeader",
      Name: "Saturno FancyHeader",
      Description: "Standardize your file headers with reusable templates.",
      Version: "2.2.4",
      Build: "28",
      Legal: "Copyright 2026 Saturno Software. All rights reserved.",
    });
    assert.match(html, /<h1>Saturno FancyHeader<\/h1>/);
    assert.match(html, /Version 2\.2\.4 - Build 28/);
    assert.match(html, /Copyright 2026 Saturno Software\. All rights reserved\./);
  });
});

describe("renderAboutPage", () => {
  const model: AboutPageModel = {
    Header: {
      IconUri: "Resources/images/icon.png",
      IconAlt: "Saturno FancyHeader",
      Name: "Saturno FancyHeader",
      Description: "Standardize your file headers with reusable templates.",
      Version: "2.2.4",
      Build: "28",
      Legal: "Copyright 2026 Saturno Software. All rights reserved.",
    },
    Publisher: {
      IconUri: "icons/saturno-software.png",
      IconAlt: "Saturno Software",
      Name: "Saturno Software",
      Description: "Discover Saturno Software solutions",
      Links: [{ Href: "https://github.com/SaturnoSoftware", Label: "GitHub", Glyph: "github" }],
    },
    MoreSoftware: [
      {
        IconUri: "icons/gosh.webp",
        IconAlt: "Gosh",
        Name: "Gosh",
        Description: "Bookmarks for your shell.",
        Links: [{ Href: "https://github.com/SaturnoSoftware/gosh", Label: "GitHub", Glyph: "github" }],
      },
    ],
    ChangelogButtonLabel: "View Changelog",
  };

  it("assembles the header card, publisher card and the software grid in order", () => {
    const html = RenderAboutPage(model);
    const header_index = html.indexOf("header-card");
    const publisher_index = html.indexOf("app-card-publisher");
    const grid_index = html.indexOf('class="grid"');
    const button_index = html.indexOf("changelog-button");

    assert.ok(header_index >= 0 && publisher_index > header_index);
    assert.ok(grid_index > publisher_index);
    assert.ok(button_index > grid_index);
    assert.match(html, /View Changelog/);
    assert.match(html, /Gosh/);
  });

  it("renders no software grid entries when there is nothing to list", () => {
    const html = RenderAboutPage({ ...model, MoreSoftware: [] });
    assert.match(html, /<div class="grid"><\/div>/);
  });
});
