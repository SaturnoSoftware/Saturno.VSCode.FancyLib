# Saturno.VSCodeKit - arquitetura

## O que este repositorio e

Biblioteca compartilhada pelas tres extensoes da familia Fancy: `vscode-fancy-header`,
`vscode-fancy-comments` e `vscode-fancy-align`.

**Nao e pacote npm.** E consumida como **submodulo git**, montada em `libs/Saturno.VSCodeKit`
dentro de cada extensao e compilada junto com ela. Isso muda o que "versao" e "release"
significam aqui, e e a razao de a VSCODEKIT-0013 existir - o repositorio nao tem `package.json`
nem tag, entao o pin de versao de um consumidor e o SHA do submodulo e mais nada.

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
tem **seis** dos sete de `src/`: `EditorUtils.ts` ficou de fora.

Isso **nao** e o corte puro-contra-vscode: `CommentSyntax.ts` e `ConfigUtils.ts` tambem importam
`vscode` e estao na lista. Entao a exclusao do `EditorUtils` e inconsistencia, nao principio.

Nada quebra hoje porque nenhum teste o importa, mas ele deixou de ser verificado por tipo pela
configuracao de teste. Registrado ao fechar a VSCODEKIT-0016, em 2026-08-28.

## Quem consome, e como

    vscode-fancy-header     libs/Saturno.VSCodeKit    compila a lib no proprio `npm test`
    vscode-fancy-comments   libs/Saturno.VSCodeKit    nao compila a lib no teste
    vscode-fancy-align      libs/Saturno.VSCodeKit    nao compila a lib no teste

O `vscode-fancy-header` e o unico cujo script de teste roda
`tsc -p libs/Saturno.VSCodeKit/tests/tsconfig.json`. Na pratica ele e o unico lugar onde uma
quebra de tipo na lib aparece automaticamente - o que e pouco para uma biblioteca com tres
consumidores, e e o que a VSCODEKIT-0014 (CI proprio) resolve.

## O risco estrutural desta forma de distribuicao

Sem versao e sem tag, cada consumidor aponta para um SHA solto. Em 2026-08-28 os tres apontavam
para commits **orfaos**, que nao eram ancestrais do HEAD nem existiam em ref nenhuma do remoto -
a lib tinha sido reduzida a raiz limpa e os gitlinks ficaram para tras. Continuava clonando so
porque o GitHub ainda servia os objetos orfaos.

Corrigido na VSCODEKIT-0016. O que impede de voltar esta na VSCODEKIT-0013 (versionamento e tag)
e na MICROTOOLS-0609 (varredura de gitlink de entrada).
