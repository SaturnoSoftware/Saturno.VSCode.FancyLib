# Saturno.VSCode.FancyLib - testes

## O que existe

Dois arquivos, em `tests/`:

    commentSyntaxCore.test.ts   o nucleo de sintaxe de comentario
    utils.test.ts               clamp e os normalizadores

Rodam em `node --test`, sem VS Code. E o que a separacao descrita no `ARCHITECTURE.md` compra: o
codigo com regra de verdade nao depende do editor, entao o teste tambem nao.

## Como rodam hoje, e o problema disso

O repositorio tem `package.json` e seu proprio `npm test`. Os consumidores tambem compilam a
biblioteca para provar a integracao:

    Saturno.VSCode.FancyHeader    "test": "... && tsc -p Libraries/Saturno.VSCode.FancyLib/tests/tsconfig.json && node --test ... out/Libraries/Saturno.VSCode.FancyLib/tests/*.test.js"

O Fancy Comments tambem compila a lib no teste. O Fancy Align ainda precisa adotar essa mesma
verificacao. Para uma biblioteca com
tres consumidores, e pouco.

Consertar isso e a VSCODEKIT-0013 (`package.json`, que da um `npm test` proprio) mais a
VSCODEKIT-0014 (CI que roda esse teste).

## O que nao esta coberto

**`EditorUtils.ts` nao e compilado pela configuracao de teste.** O `tests/tsconfig.json` lista
seis dos sete arquivos de `src/` explicitamente e deixa esse de fora.

Nao e o corte entre puro e dependente de `vscode`: `CommentSyntax.ts` e `ConfigUtils.ts` tambem
importam `vscode` e estao na lista. E inconsistencia, e vale resolver de um jeito ou de outro -
incluir, ou documentar por que fica fora.

**Nada testa a integracao com um editor de verdade.** As funcoes que tocam `vscode` sao
exercitadas so indiretamente, pelas suites das extensoes.

## O teste que a biblioteca mais precisa e nao tem

**Compilar contra os tres consumidores.** E o unico jeito de pegar quebra de contrato antes de ela
chegar neles. Uma mudanca de assinatura aqui passa nos dois testes locais e quebra tres
repositorios.

Esta escrito como escopo na VSCODEKIT-0014. Se for caro para toda mudanca, uma lane agendada ja
resolve a maior parte.

## Comando

Enquanto nao houver `package.json` proprio, a forma de rodar e por um consumidor:

    cd repos_public/VSCode/vscode-fancy-header
    npm test
