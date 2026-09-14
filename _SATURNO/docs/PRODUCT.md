# Saturno.VSCode.FancyLib - produto

## Para quem existe

Para as tres extensoes da familia Fancy, e so para elas. Nao e biblioteca de uso geral e nao
tenta ser: a superficie publica e pequena de proposito, e cresce so quando duas das tres
extensoes precisam da mesma coisa.

O criterio para algo entrar aqui: **duas extensoes ja escreveram isso, e escreveram diferente.**
Codigo que uma so usa fica nela. Duplicacao que ninguem sentiu nao vira biblioteca.

## O que entrega

**Sintaxe de comentario por linguagem.** E o nucleo. Dado um `languageId` do VS Code ou um editor
ativo, devolve como aquela linguagem escreve comentario de linha e de bloco. As tres extensoes
precisam disso e nenhuma deveria manter a propria tabela.

**Ajudantes de editor.** Editor ativo, caminho do arquivo aberto, exibicao de erro. Coisa pequena
que toda extensao reescreve e escreve um pouco diferente.

**Leitura tipada de configuracao.** `getConfigValue<T>` sobre a configuracao do VS Code.

**Saneamento de valor.** `clamp`, `normalizeInteger`, `normalizeChar`, `normalizeStringArray` -
para configuracao vinda do usuario, que chega como qualquer coisa.

## O que deliberadamente nao entrega

- **Nada de UI.** Quick Pick, painel, notificacao: cada extensao tem a propria voz e o proprio
  fluxo. Padronizar isso aqui produziria tres extensoes que parecem uma.
- **Nada de dominio.** Alinhamento e do Fancy Align, bloco de comentario e do Fancy Comments,
  cabecalho e do Fancy Header. A lib cuida do que e comum ao **ambiente**, nao ao proposito.

## O nome

O repositorio se chama `Saturno.VSCode.FancyLib`. O nome foi consolidado no GitHub e nos
consumidores pela VSCODEKIT-0010 e VSCODEKIT-0011. `VSCode` declara a plataforma e `FancyLib`
declara a familia que ela serve.

O commit de raiz atual ja se chama "Saturno FancyLib". O prefixo de task no tasker continua
`VSCODEKIT` de proposito, porque id de task e endereco permanente.

## Estado

Em uso pelas tres extensoes. O que falta como produto esta em tasks proprias: `package.json` e
versionamento (VSCODEKIT-0013), CI (VSCODEKIT-0014), e revisao contra o styleguide TypeScript
(VSCODEKIT-0015).
