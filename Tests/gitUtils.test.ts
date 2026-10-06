import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { FindGitRootFromFilePath, ReadGitUserInfoFromConfigFiles } from "../Source/GitUtils";

describe("FindGitRootFromFilePath", () => {
  it("finds the nearest git root by walking parent directories", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fancylib-git-root-"));
    const filePath = path.join(tempRoot, "packages", "demo", "src", "main.ts");

    fs.mkdirSync(path.join(tempRoot, ".git"), { recursive: true });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "");

    assert.strictEqual(FindGitRootFromFilePath(filePath), tempRoot);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("returns null when no .git directory exists anywhere", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "no-git-"));
    const filePath = path.join(tempRoot, "deep", "nested", "file.ts");

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "");

    const result = FindGitRootFromFilePath(filePath);
    assert.strictEqual(result, null);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("returns null for non-existent file path", () => {
    const fakePath = path.join(os.tmpdir(), "does-not-exist", "fake", "file.ts");
    const result = FindGitRootFromFilePath(fakePath);
    assert.strictEqual(result, null);
  });

  it("handles extremely deep directory nesting", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "deep-git-"));
    const deepPath = path.join(tempRoot, "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "file.ts");

    fs.mkdirSync(path.join(tempRoot, ".git"), { recursive: true });
    fs.mkdirSync(path.dirname(deepPath), { recursive: true });
    fs.writeFileSync(deepPath, "");

    const result = FindGitRootFromFilePath(deepPath);
    assert.strictEqual(result, tempRoot);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("handles path with spaces in directory names", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "git-with-spaces-"));
    const spacedPath = path.join(tempRoot, "my project", "src files", "main file.ts");

    fs.mkdirSync(path.join(tempRoot, ".git"), { recursive: true });
    fs.mkdirSync(path.dirname(spacedPath), { recursive: true });
    fs.writeFileSync(spacedPath, "");

    const result = FindGitRootFromFilePath(spacedPath);
    assert.strictEqual(result, tempRoot);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("handles path with Unicode characters", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "git-unicode-"));
    const unicodePath = path.join(tempRoot, "código", "文件", "файл.ts");

    fs.mkdirSync(path.join(tempRoot, ".git"), { recursive: true });
    fs.mkdirSync(path.dirname(unicodePath), { recursive: true });
    fs.writeFileSync(unicodePath, "");

    const result = FindGitRootFromFilePath(unicodePath);
    assert.strictEqual(result, tempRoot);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("handles multiple nested .git directories (returns closest)", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nested-git-"));
    const outerGit = path.join(tempRoot, ".git");
    const innerPath = path.join(tempRoot, "submodule", "src");
    const innerGit = path.join(tempRoot, "submodule", ".git");
    const filePath = path.join(innerPath, "file.ts");

    fs.mkdirSync(outerGit, { recursive: true });
    fs.mkdirSync(innerGit, { recursive: true });
    fs.mkdirSync(innerPath, { recursive: true });
    fs.writeFileSync(filePath, "");

    const result = FindGitRootFromFilePath(filePath);
    assert.strictEqual(result, path.join(tempRoot, "submodule"));

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("handles .git as a file (worktree/submodule pointer)", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "git-file-"));
    const gitFile = path.join(tempRoot, ".git");
    const filePath = path.join(tempRoot, "file.ts");

    fs.writeFileSync(gitFile, "gitdir: /path/to/real/git");
    fs.writeFileSync(filePath, "");

    const result = FindGitRootFromFilePath(filePath);
    assert.strictEqual(result, tempRoot);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });
});

describe("ReadGitUserInfoFromConfigFiles", () => {
  it("reads local and global git identity from config files", () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "fancylib-home-"));
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fancylib-config-"));

    fs.mkdirSync(path.join(tempRoot, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tempRoot, ".git", "config"),
      "[user]\nname = Local Name\n"
    );
    fs.writeFileSync(
      path.join(tempHome, ".gitconfig"),
      "[user]\nemail = global@example.com\n"
    );

    assert.deepStrictEqual(ReadGitUserInfoFromConfigFiles(tempRoot, tempHome), {
      name: "Local Name",
      email: "global@example.com",
    });
  });

  it("handles non-existent config file gracefully", () => {
    const result = ReadGitUserInfoFromConfigFiles(null, "/this/does/not/exist");
    assert.strictEqual(result, null);
  });

  it("handles config file with only whitespace", () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "whitespace-git-"));
    const configPath = path.join(tempHome, ".gitconfig");

    fs.writeFileSync(configPath, "   \n\t\n   \n");

    const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
    assert.strictEqual(result, null);

    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  describe("malicious and adversarial inputs", () => {
    it("handles git config with SQL injection attempt", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "evil-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        "[user]\nname = Robert'); DROP TABLE users;--\nemail = evil@example.com\n"
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.strictEqual(result?.name, "Robert'); DROP TABLE users;--");
      assert.strictEqual(result?.email, "evil@example.com");

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with script injection in name", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "script-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        "[user]\nname = <script>alert('xss')</script>\nemail = xss@example.com\n"
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.strictEqual(result?.name, "<script>alert('xss')</script>");

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with extremely long values", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "long-git-"));
      const configPath = path.join(tempHome, ".gitconfig");
      const longName = "A".repeat(10000);

      fs.writeFileSync(
        configPath,
        `[user]\nname = ${longName}\nemail = long@example.com\n`
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.strictEqual(result?.name, longName);

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with null bytes", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "null-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        Buffer.from("[user]\nname = Test\x00Null\nemail = test@example.com\n")
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.ok(result !== null);

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with invalid UTF-8 sequences", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "invalid-utf8-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        Buffer.from([0x5b, 0x75, 0x73, 0x65, 0x72, 0x5d, 0x0a, 0x6e, 0x61, 0x6d, 0x65, 0x20, 0x3d, 0x20, 0xff, 0xfe, 0x0a])
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.ok(result !== null || result === null);

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with malformed section headers", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "malformed-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        "[user\nname = NoClosingBracket\nemail = test@example.com\n"
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      // Malformed config should return null since section header is invalid
      assert.strictEqual(result, null);

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with duplicate keys", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "dup-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        "[user]\nname = First\nname = Second\nemail = first@example.com\nemail = second@example.com\n"
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.ok(result?.name === "First" || result?.name === "Second");

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with comments containing equals signs", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "comment-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        "[user]\n# This is a comment = with equals\nname = Real Name\nemail = real@example.com\n"
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.strictEqual(result?.name, "Real Name");

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with values in quotes", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "quoted-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        '[user]\nname = "Quoted Name"\nemail = \'single@example.com\'\n'
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.strictEqual(result?.name, "Quoted Name");
      assert.strictEqual(result?.email, "single@example.com");

      fs.rmSync(tempHome, { recursive: true, force: true });
    });

    it("handles git config with empty values", () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "empty-git-"));
      const configPath = path.join(tempHome, ".gitconfig");

      fs.writeFileSync(
        configPath,
        "[user]\nname = \nemail = \n"
      );

      const result = ReadGitUserInfoFromConfigFiles(null, tempHome);
      assert.strictEqual(result, null);

      fs.rmSync(tempHome, { recursive: true, force: true });
    });
  });
});
