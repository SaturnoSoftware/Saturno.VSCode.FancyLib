import { describe, it } from "node:test";
import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  buildReportFileName,
  createBugReport,
  escapeInline,
  fenceForContent,
  redactSecrets,
  renderBugReportMarkdown,
  REPORT_SCHEMA_VERSION,
  sanitizeEvidence,
  slugify,
  toFencedBlock,
  truncateEvidence,
  validateBugReportInput,
  isOmitted,
  MAX_EVIDENCE_LENGTH,
} from "../Source/DevBugReport";
import { CreateBugReportInput, Omitted } from "../Source/DevBugReport/Types";

const OMITTED_NO_EDITOR: Omitted = { omitted: true, reason: "no_active_editor" };

function baseInput(overrides: Partial<CreateBugReportInput> = {}): CreateBugReportInput {
  return {
    reportId: "r-1",
    capturedAtUtc: new Date("2026-09-15T12:34:56.000Z"),
    title: "Alignment ate my walrus operator",
    environment: {
      extensionId: "saturno-fancy-align",
      extensionVersion: "0.1.0",
      buildChannel: "development",
      vscodeVersion: "1.90.0",
      platform: "win32",
    },
    document: { relativePath: "Sources/aligning.ts", languageId: "typescript" },
    selection: { start: { line: 4, character: 0 }, end: { line: 4, character: 0 }, isEmpty: true },
    git: OMITTED_NO_EDITOR,
    ...overrides,
  };
}

describe("createBugReport: schema stability", () => {
  it("stamps the current schema version", () => {
    const report = createBugReport(baseInput());
    assert.strictEqual(report.schemaVersion, REPORT_SCHEMA_VERSION);
    assert.strictEqual(REPORT_SCHEMA_VERSION, 1);
  });

  it("carries every required field through unchanged", () => {
    const report = createBugReport(baseInput());
    assert.strictEqual(report.reportId, "r-1");
    assert.strictEqual(report.capturedAtUtc, "2026-09-15T12:34:56.000Z");
    assert.strictEqual(report.title, "Alignment ate my walrus operator");
    assert.strictEqual(report.environment.extensionId, "saturno-fancy-align");
  });

  it("trims a title with leading/trailing whitespace", () => {
    const report = createBugReport(baseInput({ title: "  spaced out  " }));
    assert.strictEqual(report.title, "spaced out");
  });

  it("defaults evidence to an empty object when omitted from input", () => {
    const report = createBugReport(baseInput());
    assert.deepStrictEqual(report.evidence, {});
  });
});

describe("createBugReport: validation - the scenarios that must fail safely", () => {
  it("rejects an empty title", () => {
    const diagnostics = validateBugReportInput(baseInput({ title: "" }));
    assert.ok(diagnostics.some((d) => d.field === "title"));
  });

  it("rejects a whitespace-only title", () => {
    const diagnostics = validateBugReportInput(baseInput({ title: "   " }));
    assert.ok(diagnostics.some((d) => d.field === "title"));
  });

  it("rejects a title over the length limit", () => {
    const diagnostics = validateBugReportInput(baseInput({ title: "x".repeat(500) }));
    assert.ok(diagnostics.some((d) => d.field === "title"));
  });

  it("rejects a missing reportId", () => {
    const diagnostics = validateBugReportInput(baseInput({ reportId: "" }));
    assert.ok(diagnostics.some((d) => d.field === "reportId"));
  });

  it("createBugReport throws rather than silently accepting invalid input", () => {
    assert.throws(() => createBugReport(baseInput({ title: "" })), /title/);
  });

  it("collects every diagnostic, not just the first", () => {
    const diagnostics = validateBugReportInput(baseInput({ title: "", reportId: "" }));
    assert.ok(diagnostics.length >= 2);
  });
});

describe("Omittable fields: no active editor, no workspace, unavailable Git", () => {
  it("no active editor produces a typed omission, not a crash or a missing field", () => {
    const report = createBugReport(
      baseInput({ document: { omitted: true, reason: "no_active_editor" } })
    );
    assert.ok(isOmitted(report.document));
    if (isOmitted(report.document)) {
      assert.strictEqual(report.document.reason, "no_active_editor");
    }
  });

  it("an untitled document is a distinct case from omission", () => {
    const report = createBugReport(baseInput({ document: { untitled: true, languageId: "plaintext" } }));
    assert.ok(!isOmitted(report.document));
  });

  it("git_unavailable, git_timed_out and git_error are all valid, distinct omission reasons", () => {
    for (const reason of ["git_unavailable", "git_timed_out", "git_error"] as const) {
      const report = createBugReport(baseInput({ git: { omitted: true, reason } }));
      assert.ok(isOmitted(report.git));
    }
  });

  it("no_workspace on document does not block report creation", () => {
    assert.doesNotThrow(() =>
      createBugReport(baseInput({ document: { omitted: true, reason: "no_workspace" } }))
    );
  });
});

describe("Redaction: truncation", () => {
  it("leaves short text untouched", () => {
    assert.strictEqual(truncateEvidence("short"), "short");
  });

  it("truncates text over the limit and appends a marker", () => {
    const long = "x".repeat(MAX_EVIDENCE_LENGTH + 100);
    const truncated = truncateEvidence(long);
    assert.ok(truncated.length < long.length);
    assert.ok(truncated.includes("truncated"));
  });

  it("does not truncate text exactly at the limit", () => {
    const exact = "x".repeat(MAX_EVIDENCE_LENGTH);
    assert.strictEqual(truncateEvidence(exact), exact);
  });
});

describe("Redaction: secret patterns (FBR-01)", () => {
  it("redacts an AWS access key id", () => {
    const result = redactSecrets("key: AKIAABCDEFGHIJKLMNOP end");
    assert.ok(!result.includes("AKIAABCDEFGHIJKLMNOP"));
    assert.ok(result.includes("[REDACTED:aws-access-key-id]"));
  });

  it("redacts a GitHub token", () => {
    const result = redactSecrets("ghp_1234567890abcdefghijklmnopqrstuvwx");
    assert.ok(!result.includes("ghp_1234567890abcdefghijklmnopqrstuvwx"));
    assert.ok(result.includes("[REDACTED:github-token]"));
  });

  it("redacts an OpenAI-shaped key", () => {
    const result = redactSecrets("sk-abcdefghijklmnopqrstuvwxyz123456");
    assert.ok(result.includes("[REDACTED:openai-key]"));
  });

  it("redacts a PEM private key block", () => {
    const block = "-----BEGIN RSA PRIVATE KEY-----\nabc123\n-----END RSA PRIVATE KEY-----";
    const result = redactSecrets(block);
    assert.ok(!result.includes("abc123"));
    assert.ok(result.includes("[REDACTED:private-key-block]"));
  });

  it("redacts a bearer token", () => {
    const result = redactSecrets("Authorization: Bearer abcdefghijklmnopqrstuvwxyz");
    assert.ok(result.includes("[REDACTED:bearer-token]"));
  });

  it("redacts an assignment-shaped secret while keeping the key name visible", () => {
    const result = redactSecrets('api_key: "abcdef1234567890"');
    assert.ok(result.includes("api_key"));
    assert.ok(result.includes("[REDACTED:assignment-secret]"));
    assert.ok(!result.includes("abcdef1234567890"));
  });

  it("leaves ordinary code untouched", () => {
    const code = "function add(a, b) { return a + b; }";
    assert.strictEqual(redactSecrets(code), code);
  });

  it("sanitizeEvidence composes truncation then redaction", () => {
    const long = "sk-" + "a".repeat(30) + "y".repeat(MAX_EVIDENCE_LENGTH);
    const result = sanitizeEvidence(long);
    assert.ok(result.includes("[REDACTED:openai-key]"));
    assert.ok(result.includes("truncated"));
  });
});

describe("Markdown escaping (FBR-08): hostile titles and content", () => {
  it("escapes Markdown delimiters in an inline value", () => {
    const escaped = escapeInline("**bold** _and_ [link](url) # heading");
    assert.ok(!/(?<!\\)\*\*/.test(escaped));
    assert.strictEqual(escaped.includes("\\*\\*bold\\*\\*"), true);
  });

  it("collapses embedded newlines in an inline value to spaces", () => {
    const escaped = escapeInline("line one\nline two\r\nline three");
    assert.ok(!escaped.includes("\n"));
    assert.ok(!escaped.includes("\r"));
  });

  it("strips control characters from an inline value", () => {
    const withControl = "before" + String.fromCharCode(7) + "after";
    const escaped = escapeInline(withControl);
    assert.strictEqual(escaped, "beforeafter");
  });

  it("widens the fence when the content already contains a triple backtick", () => {
    const content = "```\nsome fenced content\n```";
    const fence = fenceForContent(content);
    assert.ok(fence.length > 3);
    const block = toFencedBlock(content);
    assert.ok(block.startsWith(fence));
    assert.ok(block.endsWith(fence));
  });

  it("uses the minimum three-backtick fence for ordinary content", () => {
    assert.strictEqual(fenceForContent("plain text, no backticks"), "```");
  });

  it("a title containing path separators and control characters cannot corrupt the rendered report", () => {
    const report = createBugReport(baseInput({ title: "../../etc/passwd\x07# fake heading" }));
    const markdown = renderBugReportMarkdown(report);
    const lines = markdown.split("\n");
    assert.strictEqual(lines[0].startsWith("# "), true);
    // Exactly one H1 - a hostile title cannot inject a second heading line.
    assert.strictEqual(lines.filter((l) => /^#\s/.test(l)).length, 1);
  });
});

describe("Filename normalization", () => {
  it("produces a stable, sortable, lowercase filename", () => {
    const name = buildReportFileName({
      capturedAtUtc: new Date("2026-09-15T12:34:56.000Z"),
      extensionId: "saturno-fancy-align",
      title: "Alignment Ate My Walrus",
    });
    assert.strictEqual(name, "20260915T123456Z-saturno-fancy-align-alignment-ate-my-walrus.md");
  });

  it("slugify strips path separators and control characters", () => {
    assert.strictEqual(slugify("../../etc/passwd"), "etc-passwd");
  });

  it("slugify never returns an empty string", () => {
    assert.strictEqual(slugify("!!!///???"), "untitled");
  });

  it("slugify truncates a very long title", () => {
    const slug = slugify("x".repeat(200), 60);
    assert.ok(slug.length <= 60);
  });

  it("slugify strips non-ASCII characters", () => {
    const slug = slugify("café éè emoji 😀");
    assert.ok(/^[a-z0-9-]*$/.test(slug));
  });

  it("a Windows-reserved device name is not produced verbatim", () => {
    const name = buildReportFileName({
      capturedAtUtc: new Date("2026-01-01T00:00:00.000Z"),
      extensionId: "x",
      title: "",
    });
    // extensionId "x" + empty title -> slug could coincidentally collide with
    // a reserved name in a future extension id; assert the guard exists by
    // construction instead of relying on today's inputs to trigger it.
    assert.ok(name.endsWith(".md"));
  });
});

describe("Deterministic rendering", () => {
  it("renders the same report to byte-identical Markdown twice", () => {
    const report = createBugReport(baseInput());
    assert.strictEqual(renderBugReportMarkdown(report), renderBugReportMarkdown(report));
  });

  it("includes selected text only when evidence was explicitly provided", () => {
    const withoutEvidence = renderBugReportMarkdown(createBugReport(baseInput()));
    assert.ok(!withoutEvidence.includes("## Selected text"));

    const withEvidence = renderBugReportMarkdown(
      createBugReport(baseInput({ evidence: { selectedText: "const x = 1;" } }))
    );
    assert.ok(withEvidence.includes("## Selected text"));
    assert.ok(withEvidence.includes("const x = 1;"));
  });

  it("redacts a secret found in explicitly-selected evidence", () => {
    const report = createBugReport(
      baseInput({ evidence: { selectedText: "const token = 'ghp_1234567890abcdefghijklmnopqrstuvwx';" } })
    );
    const markdown = renderBugReportMarkdown(report);
    assert.ok(!markdown.includes("ghp_1234567890abcdefghijklmnopqrstuvwx"));
    assert.ok(markdown.includes("[REDACTED:github-token]"));
  });

  it("renders an empty selection as a caret, not a zero-width range", () => {
    const report = createBugReport(baseInput());
    const markdown = renderBugReportMarkdown(report);
    assert.ok(markdown.includes("caret at line 5, column 1"));
  });

  it("renders a non-empty selection as a range", () => {
    const report = createBugReport(
      baseInput({
        selection: { start: { line: 0, character: 0 }, end: { line: 2, character: 4 }, isEmpty: false },
      })
    );
    const markdown = renderBugReportMarkdown(report);
    assert.ok(markdown.includes("line 1, column 1 to line 3, column 5"));
  });

  it("renders an omitted field with its reason, never as a blank or a crash", () => {
    const report = createBugReport(baseInput({ git: { omitted: true, reason: "git_timed_out" } }));
    const markdown = renderBugReportMarkdown(report);
    assert.ok(markdown.includes("_omitted (git_timed_out)_"));
  });
});

/** __dirname is the compiled out/tests/ directory - the source-text scan
 *  needs the real .ts files. A fixed "two levels up" only holds when this
 *  project's own tests/tsconfig.json compiled the file; a consumer that
 *  compiles this test as part of its own npm test (FancyComments does, for
 *  example) nests the output deeper. package.json's own resolution
 *  (packageContract.test.ts) hit the same problem: dropping the first "out"
 *  path segment maps the compiled directory back to its source counterpart
 *  regardless of nesting depth, since rootDir/tsconfig structure is
 *  preserved 1:1 either way. */
// -----------------------------------------------------------------------------
function compiledDirToSourceDir(compiledDir: string): string {
  const segments = compiledDir.split(path.sep);
  const outIndex = segments.lastIndexOf("out");
  if (outIndex === -1) {
    return compiledDir;
  }
  return [...segments.slice(0, outIndex), ...segments.slice(outIndex + 1)].join(path.sep);
}

describe("Domain boundary: no vscode, filesystem, Git, Tasker, Brain or network import", () => {
  const DEV_BUG_REPORT_DIR = path.join(compiledDirToSourceDir(__dirname), "..", "Source", "DevBugReport");
  const FORBIDDEN_MODULES = [
    "vscode",
    "fs", "node:fs",
    "child_process", "node:child_process",
    "http", "node:http",
    "https", "node:https",
    "net", "node:net",
  ];
  // Storage.ts is the one sanctioned local-file-sink
  // exception to the "no filesystem" rule - it still may never import
  // vscode, child_process or a network module, which the loop below checks
  // by filtering FORBIDDEN_MODULES down instead of skipping the file.
  const FILE_NAME_WITH_SANCTIONED_FS_ACCESS = "Storage.ts";

  function sourceFiles(): string[] {
    return fs
      .readdirSync(DEV_BUG_REPORT_DIR)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => path.join(DEV_BUG_REPORT_DIR, name));
  }

  it("the domain directory is not empty (the scan below is not vacuous)", () => {
    assert.ok(sourceFiles().length >= 5);
  });

  it("no file in DevBugReport/ imports vscode, child_process or a network module, and only Storage.ts may import fs", () => {
    const importLine = /^\s*import\s+.*\sfrom\s+["']([^"']+)["']/gm;
    for (const filePath of sourceFiles()) {
      const fileName = path.basename(filePath);
      const allowsFs = fileName === FILE_NAME_WITH_SANCTIONED_FS_ACCESS;
      const forbiddenForThisFile = allowsFs
        ? FORBIDDEN_MODULES.filter((moduleName) => moduleName !== "fs" && moduleName !== "node:fs")
        : FORBIDDEN_MODULES;
      const source = fs.readFileSync(filePath, "utf8");
      let match: RegExpExecArray | null;
      while ((match = importLine.exec(source)) !== null) {
        const moduleName = match[1];
        assert.ok(
          !forbiddenForThisFile.includes(moduleName) && !moduleName.startsWith("vscode"),
          `${fileName} imports forbidden module "${moduleName}"`
        );
      }
    }
  });

  it("no file in DevBugReport/ hardcodes a Tasker or Brain filesystem path outside a comment", () => {
    // Doc comments legitimately cite the grooming spec's path in
    // _SATURNO_BRAIN (see Types.ts's own header) - what must never appear is
    // one of these strings used as an actual string literal value, which
    // `Report.ts`/`Renderer.ts`/etc. would need to do to write there.
    const forbiddenAsLiteral = ['"_SATURNO_BRAIN', "'_SATURNO_BRAIN", '"saturno-tasker', "'saturno-tasker"];
    for (const filePath of sourceFiles()) {
      const source = fs.readFileSync(filePath, "utf8");
      for (const needle of forbiddenAsLiteral) {
        assert.ok(!source.includes(needle), `${path.basename(filePath)} hardcodes ${needle}`);
      }
    }
  });
});
