# Contributing

Este projeto segue uma estrategia de evolucao segura para codigo legado.
Leia primeiro o documento mestre: [MANIFESTO_TECNICO.md](MANIFESTO_TECNICO.md).

## Principios

- preservar comportamento existente
- reduzir acoplamento sem overengineering
- padronizar nomenclatura e estrutura de pastas
- priorizar codigo simples, testavel e bem documentado

## Fluxo de Trabalho

1. Entenda o comportamento atual antes de alterar.
2. Defina um escopo pequeno de refatoracao.
3. Implemente de forma incremental e reversivel.
4. Valide funcionalidade e impactos.
5. Atualize documentacao do modulo.

## Estrutura Recomendada

- organizar por contexto de dominio
- separar domain, application, infrastructure e presentation
- concentrar componentes visuais em src/ui

## Regras de Qualidade

- aplicar SRP e nomes semanticos
- evitar duplicacao e codigo morto
- evitar abstracoes sem ganho real
- escrever codigo preparado para testes

## Documentacao por Modulo

Ao criar ou refatorar modulo relevante, incluir README.md contendo:

- proposito
- decisoes arquiteturais
- como usar
- exemplos

## Pull Requests

Cada PR deve incluir:

- problema atacado
- estrategia adotada
- riscos identificados
- evidencias de validacao
- impactos em documentacao