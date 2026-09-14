<p align="center">
  <b>Saturno's FancyLib</b>
</p>

<p align="center">
    <a href="https://github.com/SaturnoSoftware/Saturno.FancyLib/commits"><img src="https://badgen.net/github/commits/SaturnoSoftware/vscode-fancy-lib?cache=600" alt="commits"></a>
    <a href="https://github.com/SaturnoSoftware/Saturno.FancyLib"><img src="https://badgen.net/badge/language/TypeScript/blue" alt="Language: TypeScript"></a>
    <a href="https://code.visualstudio.com/api"><img src="https://badgen.net/badge/platform/VS%20Code%20Extensions/blue" alt="Platform: VS Code Extensions"></a>
</p>

<p align="center">
  <b>Shared TypeScript helpers for Saturno VS Code extensions.</b>
  <br>
</p>


**Saturno.FancyLib** is a small source library used by Saturno VS Code extensions. It provides shared helpers for reading VS Code working with the active editor.

It is used by:
  - [Saturno FancyHeader](https://github.com/SaturnoSoftware/vscode-fancy-header) 
  - [Saturno FancyComments](https://github.com/SaturnoSoftware/vscode-fancy-comments).

Maintained by [Saturno.Software](https://saturno.software/).

---

## Quick Start

```bash
git submodule add https://github.com/SaturnoSoftware/vscode-fancy-lib libs/Saturno.FancyLib
git submodule update --init --recursive
npm install json5
```

```typescript
import {
  getActiveEditor,
  getCommentSyntaxForEditor,
  showError,
} from "../libs/Saturno.FancyLib/src";

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
git submodule add https://github.com/SaturnoSoftware/Saturno.FancyLib libs/Saturno.FancyLib
```


### Requirements

- VS Code extension project
- TypeScript
- `json5`

---


## License

This project is licensed as **GPLv3** or later.

---

## Links

- [Saturno FancyHeader](https://github.com/SaturnoSoftware/vscode-fancy-header)
- [Saturno FancyComments](https://github.com/SaturnoSoftware/vscode-fancy-comments)

- [Saturno.Software](https://saturno.software/)

---

<p align="center">
  <b>Made with &lt;3 by Saturno.Software</b>
</p>
