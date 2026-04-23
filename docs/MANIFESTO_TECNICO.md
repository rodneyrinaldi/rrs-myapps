# Manifesto Tecnico

## Objetivo Geral

Transformar o sistema em uma aplicacao profissional, reutilizavel e escalavel, aplicando de forma pragmatica:

- SOLID
- DDD Lite
- Clean Architecture
- Clean Code

## 1. Diretrizes de Arquitetura

### 1.1 Clean Architecture Pragmatica

- Separar regras de negocio de detalhes de infraestrutura.
- Centralizar logica de dominio em Services e Domain.
- Isolar adaptadores externos em camadas de infraestrutura.
- Evitar abstracoes desnecessarias quando o dominio for simples.
- Priorizar legibilidade, simplicidade e baixo acoplamento.

### 1.2 DDD Lite

- Usar Entidades de Dominio para regras e invariantes.
- Usar Value Objects para conceitos imutaveis com validacao.
- Usar Domain Services para comportamentos que nao pertencem a uma unica entidade.
- Organizar por Bounded Context para manter coesao e independencia.
- Evitar complexidade acidental e modelagem excessiva.

### 1.3 SOLID e Clean Code

- Aplicar SRP em modulos, classes e funcoes.
- Preferir composicao a heranca.
- Usar nomes semanticos e orientados ao dominio.
- Limitar funcoes longas e classes com responsabilidades misturadas.
- Escrever codigo explicito e de facil manutencao.

## 2. Padroes de Nomenclatura

- Arquivos e pastas: kebab-case.
- Componentes React: PascalCase.
- Funcoes e variaveis: camelCase.
- Tipos e interfaces: PascalCase.
- Constantes globais: UPPER_SNAKE_CASE.
- Nomes orientados ao negocio, evitando abreviacoes opacas.

## 3. Regras de Organizacao de Pastas

Estrutura alvo por contexto de negocio:

```text
src/
  modules/
    <contexto>/
      domain/
        entities/
        value-objects/
        services/
      application/
        use-cases/
      infrastructure/
        repositories/
        adapters/
      presentation/
        components/
        pages/
```

Regras:

- Evitar dependencia direta de presentation para infrastructure.
- Fluxo preferencial: presentation -> application -> domain.
- Infrastructure implementa contratos usados por application/domain quando necessario.

## 4. Persistencia

- Utilizar o ORM oficial definido no projeto, com confirmacao previa antes de mudancas estruturais.
- Permitir transito direto de entidades simples entre camadas quando isso reduzir complexidade sem perda de clareza.
- Repositorios devem ser pequenos, diretos e focados em intencao de negocio.
- Evitar mapeamentos e DTOs sem ganho objetivo.

## 5. Padrao de Testes

- Todo codigo novo deve nascer pronto para teste.
- Priorizar funcoes puras e isolamento de efeitos colaterais.
- Cobrir regras criticas de dominio com testes de unidade.
- Cobrir fluxos essenciais com testes de integracao.
- Evitar mocks desnecessarios quando teste real for viavel e simples.

## 6. Padrao de Documentacao

Cada modulo relevante deve incluir README.md com:

- proposito do modulo
- decisoes arquiteturais
- como usar
- exemplos de codigo

Mudancas de refatoracao devem registrar:

- problema encontrado
- impacto esperado
- estrategia de seguranca para preservar comportamento

## 7. Padrao de UI

- Toda interface deve usar componentes centralizados em src/ui.
- Estilos devem ser isolados e reutilizaveis.
- Nao criar componentes duplicados para resolver o mesmo problema visual.
- Nao criar estilos soltos fora da estrategia de design definida.
- Qualquer novo estilo global deve ser proposto e aprovado antes da adocao.

## 8. Padrao de Refatoracao de Legado

Fluxo minimo para cada refatoracao:

1. Identificar riscos e problemas estruturais.
2. Definir escopo pequeno e incremental.
3. Preservar comportamento funcional existente.
4. Refatorar com seguranca e testes.
5. Documentar decisoes e trade-offs.

Checklist de seguranca:

- comportamento atual mapeado
- mudanca pequena e reversivel
- validacao local executada
- documentacao atualizada

## 9. Modo de Operacao do Executor

Para qualquer alteracao tecnica:

1. Seguir este manifesto de forma rigorosa.
2. Explicar decisoes de arquitetura e implementacao.
3. Sugerir melhorias objetivas quando detectar risco.
4. Nao introduzir complexidade sem necessidade.
5. Priorizar clareza, consistencia e sustentabilidade.