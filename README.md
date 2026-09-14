<p align="center">
  <b>Saturno.VSCode.FancyLib</b>
</p>

<p align="center">
    <a href="https://github.com/SaturnoSoftware/Saturno.VSCode.FancyLib/commits"><img src="https://badgen.net/github/commits/SaturnoSoftware/Saturno.VSCode.FancyLib?cache=600" alt="commits"></a>
    <a href="https://github.com/SaturnoSoftware/Saturno.VSCode.FancyLib"><img src="https://badgen.net/badge/language/TypeScript/blue" alt="Language: TypeScript"></a>
    <a href="https://code.visualstudio.com/api"><img src="https://badgen.net/badge/platform/VS%20Code%20Extensions/blue" alt="Platform: VS Code Extensions"></a>
</p>

<p align="center">
  <b>Shared TypeScript helpers for Saturno VS Code extensions.</b>
  <br>
</p>


**Saturno.VSCode.FancyLib** is a small source library used by Saturno VS Code extensions. It provides shared helpers for reading VS Code comment syntax and working with the active editor.

It is used by [Saturno FancyHeader](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyHeader) and [Saturno FancyComments](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyComments).

Maintained by [Saturno.Software](https://saturno.software/).

---

## Quick Start

```bash
git submodule add https://github.com/SaturnoSoftware/Saturno.VSCode.FancyLib Libraries/Saturno.VSCode.FancyLib
git submodule update --init --recursive
npm install json5
```

```typescript
import {
  getActiveEditor,
  getCommentSyntaxForEditor,
  showError,
} from "../Libraries/Saturno.VSCode.FancyLib/Source";

const editor = getActiveEditor();
if (!editor) {
  showError("No active editor");
  return;
}

const syntax = getCommentSyntaxForEditor(editor);
```

---

## Installation

### As a Source Library

```bash
git submodule add https://github.com/SaturnoSoftware/Saturno.VSCode.FancyLib Libraries/Saturno.VSCode.FancyLib
```

Then import from the source entry point:

```typescript
import { getCommentSyntaxForEditor } from "../Libraries/Saturno.VSCode.FancyLib/Source";
```

### Requirements

- VS Code extension project
- TypeScript
- `json5`

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
Saturno.VSCode.FancyLib/
└── Source/
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

This project is licensed as **GPLv3** or later.

---

## Links

- [GitHub Repository](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyLib)
- [Saturno FancyHeader](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyHeader)
- [Saturno FancyComments](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyComments)
- [Saturno.Software](https://saturno.software/)

---

<p align="center">
  <b>Made with &lt;3 by Saturno.Software</b>
</p>
