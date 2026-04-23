# Modulo Apps - Persistencia Local

## Proposito

Este modulo centraliza a persistencia dos dados do MyApps no banco local do navegador.
O objetivo e permitir operacao offline e independencia de fonte remota para leitura/escrita do estado de negocio.

## Decisoes Arquiteturais

- Camada de infraestrutura dedicada em `infrastructure/local-db.ts`.
- Snapshot unico versionado em `localStorage` para manter consistencia.
- `apps.json` e usado apenas como seed inicial quando nao existe banco local.
- Importacao aceita dois formatos:
  - lista simples de apps (legado)
  - snapshot completo do banco local (interoperabilidade)

## Como Usar

1. Carregar banco local:

```ts
const snapshot = await loadAppsDb();
```

2. Persistir alteracoes:

```ts
saveAppsDb(snapshot);
```

3. Exportar snapshot:

```ts
downloadAppsDb(snapshot);
```

4. Importar a partir de arquivo JSON:

```ts
const imported = parseImportedDb(jsonText);
saveAppsDb(imported);
```

## Estrutura do Snapshot

```ts
interface AppsLocalDb {
  version: 1;
  links: AppLink[];
  favorites: string[];
  recent: string[];
  usageCount: Record<string, number>;
  updatedAt: string;
}
```