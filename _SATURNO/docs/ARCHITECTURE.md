# Saturno.VSCode.FancyLib - arquitetura

## O que este repositorio e

Biblioteca compartilhada pelas tres extensoes da familia Fancy: `vscode-fancy-header`,
`vscode-fancy-comments` e `vscode-fancy-align`.

**Nao e pacote npm para consumidores.** E consumida como **submodulo git**, montada em
`Libraries/Saturno.VSCode.FancyLib` dentro de cada extensao e compilada junto com ela. O
`package.json` proprio existe para compilar, testar e declarar a superficie TypeScript. O pin de
versao de um consumidor continua sendo o SHA do submodulo.

## O corte que organiza o codigo

A divisao que importa e entre o que depende do `vscode` e o que nao depende:

| Arquivo | Depende de `vscode` | O que faz |
|---|---|---|
| `CommentSyntaxCore.ts` | nao | Resolve sintaxe de comentario a partir de uma configuracao de linguagem ja carregada. E o nucleo, e e testavel sem editor. |
| `Types.ts` | nao | `CommentSyntax` - a forma do resultado. |
| `Utils.ts` | nao | `clamp`, `normalizeInteger`, `normalizeChar`, `normalizeStringArray`. Saneamento de valor vindo de configuracao. |
| `index.ts` | nao | Superficie publica. |
| `CommentSyntax.ts` | **sim** | Envolve o nucleo e resolve a partir de um `languageId` ou de um editor ativo. |
| `ConfigUtils.ts` | **sim** | `getConfigValue<T>` sobre a configuracao do VS Code. |
| `EditorUtils.ts` | **sim** | Editor ativo, caminho do arquivo, exibicao de erro. |

O valor desse corte: o nucleo de sintaxe de comentario - que e a parte com regra de verdade e a
que as tres extensoes usam - roda em teste de node puro, sem instanciar editor. E por isso que a
suite e rapida e roda em CI sem VS Code.

## Uma inconsistencia conhecida

`tests/tsconfig.json` lista os arquivos a compilar explicitamente, em vez de usar glob, e a lista
incluia seis dos sete arquivos de `Source/`: `EditorUtils.ts` ficava de fora.

Isso **nao** e o corte puro-contra-vscode: `CommentSyntax.ts` e `ConfigUtils.ts` tambem importam
`vscode` e estao na lista. Entao a exclusao do `EditorUtils` e inconsistencia, nao principio.

O `tests/tsconfig.json` agora inclui todos os sete arquivos. A verificacao de tipo deixa de
depender de um consumidor importar `EditorUtils.ts`.

## Quem consome, e como

    Saturno.VSCode.FancyHeader    Libraries/Saturno.VSCode.FancyLib    compila a lib no proprio `npm test`
    Saturno.VSCode.FancyComments  Libraries/Saturno.VSCode.FancyLib    compila a lib no proprio `npm test`
    Saturno.VSCode.FancyAlign     Libraries/Saturno.VSCode.FancyLib    valida o pin do submodulo

O `vscode-fancy-header` e o unico cujo script de teste roda
`tsc -p Libraries/Saturno.VSCode.FancyLib/tests/tsconfig.json`. A FancyLib tambem possui seu
proprio `npm test`, que e o primeiro controle da sua compilacao.

## O risco estrutural desta forma de distribuicao

Sem versao e sem tag, cada consumidor aponta para um SHA solto. Em 2026-08-28 os tres apontavam
para commits **orfaos**, que nao eram ancestrais do HEAD nem existiam em ref nenhuma do remoto -
a lib tinha sido reduzida a raiz limpa e os gitlinks ficaram para tras. Continuava clonando so
porque o GitHub ainda servia os objetos orfaos.

Corrigido na VSCODEKIT-0016. O que impede de voltar esta na VSCODEKIT-0013 (versionamento e tag)
e na MICROTOOLS-0609 (varredura de gitlink de entrada).
