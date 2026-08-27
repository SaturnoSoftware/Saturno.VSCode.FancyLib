<p align="center">
  <b>Saturno.VSCodeKit</b>
</p>

<p align="center">
    <a href="https://github.com/SaturnoSoftware/Saturno.VSCodeKit/commits"><img src="https://badgen.net/github/commits/SaturnoSoftware/Saturno.VSCodeKit?cache=600" alt="commits"></a>
    <a href="https://github.com/SaturnoSoftware/Saturno.VSCodeKit"><img src="https://badgen.net/badge/language/TypeScript/blue" alt="Language: TypeScript"></a>
    <a href="https://code.visualstudio.com/api"><img src="https://badgen.net/badge/platform/VS%20Code%20Extensions/blue" alt="Platform: VS Code Extensions"></a>
</p>

<p align="center">
  <b>Shared TypeScript helpers for Saturno VS Code extensions.</b> Comment syntax and editor utilities.
  <br>
  <br>
</p>


**Saturno.VSCodeKit** is a small source library used by Saturno VS Code extensions. It provides shared helpers for reading VS Code comment syntax and working with the active editor.

It is used by [Saturno FancyHeader](https://github.com/SaturnoSoftware/vscode-fancy-header) and [Saturno FancyComments](https://github.com/SaturnoSoftware/vscode-fancy-comments).

Maintained by [Saturno.Software](https://saturno.software/).

---

## Quick Start

```bash
git submodule add https://github.com/SaturnoSoftware/Saturno.VSCodeKit libs/Saturno.VSCodeKit
git submodule update --init --recursive
npm install json5
```

```typescript
import {
  getActiveEditor,
  getCommentSyntaxForEditor,
  showError,
} from "../libs/Saturno.VSCodeKit/src";

const editor = getActiveEditor();
if (!editor) {
  showError("No active editor");
  return;
}

const syntax = getCommentSyntaxForEditor(editor);
```

---

## Features

- **Comment Syntax Detection** -- Reads VS Code language configuration for `//`, `#`, `/* */`, `<!-- -->`, and more
- **Editor Utilities** -- Helpers for active editor, active file path, and error messages

---

## Installation

### As a Source Library

```bash
git submodule add https://github.com/SaturnoSoftware/Saturno.VSCodeKit libs/Saturno.VSCodeKit
```

Then import from the source entry point:

```typescript
import { getCommentSyntaxForEditor } from "../libs/Saturno.VSCodeKit/src";
```

### Requirements

- VS Code extension project
- TypeScript
- `json5`

This is not currently an npm package. It is intended to be vendored into extension repositories and compiled with the host extension.

---

## Usage

### Detect Comment Syntax

```typescript
const syntax = getCommentSyntaxForEditor(editor);

if (!syntax) {
  showError(`Unsupported language "${editor.document.languageId}"`);
  return;
}

console.log(syntax.singleLineStart);
```

## Main Exports

- `getCommentSyntax`, `getCommentSyntaxForEditor`
- `resolveCommentSyntaxFromComments`
- `getActiveEditor`, `getActiveFilePath`, `showError`

---

## Repository Layout

```text
Saturno.VSCodeKit/
└── src/
    ├── CommentSyntax.ts
    ├── CommentSyntaxCore.ts
    ├── EditorUtils.ts
    ├── index.ts
    ├── Types.ts
    └── tests/
```

---

## Testing

`CommentSyntaxCore` is intentionally pure and can be tested outside the VS Code extension host.
The extension-host helpers are validated by consumer extension test suites.

```bash
tsc -p tests/tsconfig.json
node --test out/tests/*.test.js
```

---

## Contributing

Contributions welcome! Please:
- Keep helpers reusable across Saturno VS Code extensions
- Prefer small functions with focused behavior
- Keep extension-specific behavior, such as FancyHeader templates and metadata rules, in the consuming extension until another real consumer proves the shared boundary
- Submit pull requests against `main`

---

## License

No standalone license file is currently present in this repository.

---

## FAQ

**Q: Is this an npm package?**  
A: Not currently. It is a source library used through Git submodules.

**Q: Does it work outside VS Code?**  
A: Some pure helpers do, but the kit is designed for VS Code extensions.

**Q: Why does it use `json5`?**  
A: VS Code language configuration files may contain comments or trailing commas.

---

## Links

- [GitHub Repository](https://github.com/SaturnoSoftware/Saturno.VSCodeKit)
- [Saturno FancyHeader](https://github.com/SaturnoSoftware/vscode-fancy-header)
- [Saturno FancyComments](https://github.com/SaturnoSoftware/vscode-fancy-comments)
- [Saturno.Software](https://saturno.software/)

---

<p align="center">
  <b>Made with &lt;3 by Saturno.Software</b>
</p>
