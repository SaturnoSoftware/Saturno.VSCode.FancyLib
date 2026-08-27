import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { resolveCommentSyntaxFromComments } from "../src/CommentSyntaxCore";

describe("resolveCommentSyntaxFromComments", () => {
  it("returns null for missing or empty language comment configuration", () => {
    assert.strictEqual(resolveCommentSyntaxFromComments(undefined), null);
    assert.strictEqual(resolveCommentSyntaxFromComments(null), null);
    assert.strictEqual(resolveCommentSyntaxFromComments({}), null);
  });

  it("preserves line-comment tokens exactly", () => {
    assert.deepStrictEqual(resolveCommentSyntaxFromComments({ lineComment: "#" }), {
      singleLineStart: "#",
      singleLineEnd: "",
      multiLineStart: "#",
      multiLineMiddle: "#",
      multiLineEnd: "#",
    });
  });

  it("prefers line comments over block comments when both are available", () => {
    assert.deepStrictEqual(
      resolveCommentSyntaxFromComments({
        lineComment: "//",
        blockComment: ["/*", "*/"],
      }),
      {
        singleLineStart: "//",
        singleLineEnd: "",
        multiLineStart: "//",
        multiLineMiddle: "//",
        multiLineEnd: "//",
      }
    );
  });

  it("uses block comment open and close tokens when no line comment is available", () => {
    assert.deepStrictEqual(resolveCommentSyntaxFromComments({ blockComment: ["<!--", "-->"] }), {
      singleLineStart: "<!--",
      singleLineEnd: "-->",
      multiLineStart: "<!--",
      multiLineMiddle: "-",
      multiLineEnd: "-->",
    });
  });

  it("handles one-character block delimiters without widening the syntax token", () => {
    assert.deepStrictEqual(resolveCommentSyntaxFromComments({ blockComment: ["{", "}"] }), {
      singleLineStart: "{",
      singleLineEnd: "}",
      multiLineStart: "{",
      multiLineMiddle: "{",
      multiLineEnd: "}",
    });
  });
});
