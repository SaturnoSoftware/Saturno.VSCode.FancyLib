# Saturno.VSCodeKit - entrada para agentes

Este arquivo e um **ponteiro fino**, na arquitetura que o
`_SATURNO_MASTER/docs/standards/documentation/AI-TOOL-CONFIG.md` prescreve. Ele nao repete regra:
diz onde a regra mora, para Claude, Codex, Copilot e Grok lerem a mesma coisa.

## Regras nao negociaveis do workspace

**Nunca** commitar, assinar ou rotular mudanca como feita por AI, Copilot, Claude, Codex ou
qualquer assistente. Sem trailer, sem assinatura, sem rastro de "gerado por AI" - inclusive o
`Co-Authored-By` padrao. A autoria declarada pelo repositorio fica como esta.

**Charset ASCII.** Nada de travessao, aspa curva, reticencia de um caractere, seta, emoji ou
caractere de caixa - em codigo, comentario, documentacao, mensagem de commit ou JSON. Acento fica:
`nao` e `voce` sem acento sao portugues errado. Padrao completo, com as tres excecoes estreitas:
`_SATURNO_MASTER/docs/standards/PLAIN-TEXT-CHARSET.md`.

## Estilo de codigo - as tres camadas

Este repositorio nao carrega guia proprio. A stack esta declarada em `_SATURNO/VERSION.json` e as
regras vivem em `_SATURNO_MASTER/docs/standards/code-standards/`:

1. **`SATURNO-STYLEGUIDE.md`** - o modelo de nomes, o header de arquivo, a regra de charset. Vale
   para toda linguagem.
2. **`languages/TYPESCRIPT.md`** - o que a linguagem impoe.
3. **`platforms/`** - o guia de extensao do VS Code, para o que o runtime forca.

O modelo de nomes em uma linha, porque e o que mais se erra: publico `PascalCase`, privado
`_PascalCase`, estatico `sPascalCase`, constante `UPPER_SNAKE_CASE`, parametro `camelCase`,
variavel local `snake_case`. Ele **discorda** da configuracao padrao do `eslint`, e isso e
esperado.

## O que este repositorio e

Biblioteca compartilhada pelas tres extensoes Fancy, consumida como **submodulo git** em
`libs/Saturno.VSCodeKit`, nao como pacote npm. Antes de mexer, ler `_SATURNO/docs/ARCHITECTURE.md`
- em especial o corte entre o que depende de `vscode` e o que nao depende, que e o que mantem o
nucleo testavel.

**Uma mudanca aqui alcanca tres repositorios.** Assinatura alterada sem conferir os consumidores
quebra os tres de uma vez, e hoje so o `vscode-fancy-header` compila esta lib no teste dele.

## Estado e trabalho aberto

O acompanhamento fica no `saturno-tasker`, projeto `SATURNO.VSCODEKIT`:

    saturno-tasker context --project SATURNO.VSCODEKIT

O que falta e sabido: `package.json` e versionamento (VSCODEKIT-0013), CI proprio
(VSCODEKIT-0014), revisao contra o styleguide (VSCODEKIT-0015), e o rename para
`Saturno.FancyLib` (VSCODEKIT-0010 e 0011).
