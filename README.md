<p align="center">
    <img src="./Resources/icons/icon.png" alt="Saturno FancyLib" width="160">
</p>

<p align="center">
  <b>Saturno FancyLib</b>
</p>

<p align="center">
    <a href="https://github.com/SaturnoSoftware/Saturno.VSCode.FancyHeader/releases"><img src="https://badgen.net/github/release/SaturnoSoftware/Saturno.VSCode.FancyHeader?cache=600" alt="latest release"></a>
    <a href="https://github.com/SaturnoSoftware/Saturno.VSCode.FancyLib"><img src="https://badgen.net/badge/language/TypeScript/blue" alt="Language: TypeScript"></a>
    <a href="./LICENSE.txt"><img src="https://badgen.net/badge/license/GPL-3.0/blue" alt="License: GPL-3.0"></a>
    <a href="https://marketplace.visualstudio.com/items?itemName=SaturnoSoftware.saturno-fancy-header"><img src="https://badgen.net/badge/platform/VS%20Code%20%5E1.88.0/blue" alt="Platform"></a>
</p>

<p align="center">
  <b>Shared TypeScript helpers for Saturno VS Code extensions.</b>
  <br>
</p>


**Saturno.VSCode.FancyLib** is a small source library used by Saturno VS Code extensions. 

It is used by: 
  - [Saturno FancyHeader](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyHeader)
  - [Saturno FancyComments](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyComments)
  - [Saturno FancyGroups](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyGroups)
  - [Saturno OpenIn](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyGroups)

Maintained by [Saturno.Software](https://saturno.software/).

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

---

## Contributing

Contributions welcome! Please:
- Keep helpers reusable across Saturno VS Code extensions
- Prefer small functions with focused behavior
- Keep extension-specific behavior, such as FancyHeader templates and metadata rules, 
  in the consuming extension until another real consumer proves the shared boundary
- Submit pull requests against `main`

---

## License

This project is licensed as **GPLv3** or later.

---

## Links

- [GitHub Repository](https://github.com/SaturnoSoftware/Saturno.VSCode.FancyLib)
- [Saturno.Software](https://saturno.software/)

---

<p align="center">
  <b>Made with &lt;3 by Saturno.Software</b>
</p>
