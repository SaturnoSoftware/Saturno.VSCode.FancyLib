import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { _ResolveCommentSyntaxFromComments } from "../Source/CommentUtils";

describe("_ResolveCommentSyntaxFromComments", () => {
  it("returns null for missing or empty language comment configuration", () => {
    assert.strictEqual(_ResolveCommentSyntaxFromComments(undefined), null);
    assert.strictEqual(_ResolveCommentSyntaxFromComments(null), null);
    assert.strictEqual(_ResolveCommentSyntaxFromComments({}), null);
  });

  it("preserves line-comment tokens exactly", () => {
    assert.deepStrictEqual(_ResolveCommentSyntaxFromComments({ lineComment: "#" }), {
      singleLineStart: "#",
      singleLineEnd: "",
      multiLineStart: "#",
      multiLineMiddle: "#",
      multiLineEnd: "#",
    });
  });

  it("prefers line comments over block comments when both are available", () => {
    assert.deepStrictEqual(
      _ResolveCommentSyntaxFromComments({
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
    assert.deepStrictEqual(_ResolveCommentSyntaxFromComments({ blockComment: ["<!--", "-->"] }), {
      singleLineStart: "<!--",
      singleLineEnd: "-->",
      multiLineStart: "<!--",
      multiLineMiddle: "-",
      multiLineEnd: "-->",
    });
  });

  it("handles one-character block delimiters without widening the syntax token", () => {
    assert.deepStrictEqual(_ResolveCommentSyntaxFromComments({ blockComment: ["{", "}"] }), {
      singleLineStart: "{",
      singleLineEnd: "}",
      multiLineStart: "{",
      multiLineMiddle: "{",
      multiLineEnd: "}",
    });
  });
});
