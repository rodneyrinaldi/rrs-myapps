export interface AppLink {
  name: string;
  title: string;
  link: string;
  category?: string;
}

export interface AppsLocalDb {
  version: 1;
  links: AppLink[];
  categories: string[];
  categoryColors: Record<string, string>;
  favorites: string[];
  recent: string[];
  usageCount: Record<string, number>;
  updatedAt: string;
}

const STORAGE_KEY = 'rrs-myapps-local-db-v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isAppLink(value: unknown): value is AppLink {
  if (!isRecord(value)) return false;

  return (
    typeof value.name === 'string' &&
    typeof value.title === 'string' &&
    typeof value.link === 'string' &&
    (value.category === undefined || typeof value.category === 'string')
  );
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function toUsageMap(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};

  const entries = Object.entries(value)
    .filter(([, count]) => typeof count === 'number' && Number.isFinite(count) && count >= 0)
    .map(([name, count]) => [name, count] as const);

  return Object.fromEntries(entries) as Record<string, number>;
}

function toCategoryColorMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  const hexColor = /^#([0-9a-fA-F]{6})$/;
  const entries = Object.entries(value)
    .filter(([name, color]) => typeof name === 'string' && typeof color === 'string' && hexColor.test(color))
    .map(([name, color]) => [name, color] as const);

  return Object.fromEntries(entries) as Record<string, string>;
}

function normalizeLinks(value: unknown): AppLink[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isAppLink);
}

function createDbSnapshot(partial: Partial<AppsLocalDb>): AppsLocalDb {
  const links = normalizeLinks(partial.links);
  const linkedCategories = links
    .map(link => link.category)
    .filter((category): category is string => Boolean(category));

  const categories = Array.from(new Set([...toStringArray(partial.categories), ...linkedCategories]));
  const categoryColors = toCategoryColorMap(partial.categoryColors);

  return {
    version: 1,
    links,
    categories,
    categoryColors: Object.fromEntries(
      Object.entries(categoryColors).filter(([category]) => categories.includes(category))
    ),
    favorites: toStringArray(partial.favorites),
    recent: toStringArray(partial.recent).slice(0, 10),
    usageCount: toUsageMap(partial.usageCount),
    updatedAt: new Date().toISOString()
  };
}

export function saveAppsDb(snapshot: AppsLocalDb): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

async function createSeedSnapshot(): Promise<AppsLocalDb> {
  const response = await fetch('/apps.json');
  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao carregar apps.json.`);
  }

  const json = await response.json();
  const snapshot = createDbSnapshot({ links: normalizeLinks(json) });

  saveAppsDb(snapshot);
  return snapshot;
}

export async function loadAppsDb(): Promise<AppsLocalDb> {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;

      if (isRecord(parsed) && Array.isArray(parsed.links)) {
        const snapshot = createDbSnapshot({
          links: parsed.links,
          categories: toStringArray(parsed.categories),
          categoryColors: toCategoryColorMap(parsed.categoryColors),
          favorites: toStringArray(parsed.favorites),
          recent: toStringArray(parsed.recent),
          usageCount: toUsageMap(parsed.usageCount)
        });

        saveAppsDb(snapshot);
        return snapshot;
      }
    } catch {
      // Ignore invalid local state and recreate from seed.
    }
  }

  return createSeedSnapshot();
}

export function parseImportedDb(jsonText: string): AppsLocalDb {
  const parsed = JSON.parse(jsonText) as unknown;

  if (Array.isArray(parsed)) {
    return createDbSnapshot({ links: parsed });
  }

  if (isRecord(parsed) && Array.isArray(parsed.links)) {
    return createDbSnapshot({
      links: parsed.links,
      categories: toStringArray(parsed.categories),
      categoryColors: toCategoryColorMap(parsed.categoryColors),
      favorites: toStringArray(parsed.favorites),
      recent: toStringArray(parsed.recent),
      usageCount: toUsageMap(parsed.usageCount)
    });
  }

  throw new Error('Formato invalido para importacao. Use um JSON de snapshot ou lista de apps.');
}

export function downloadAppsDb(snapshot: AppsLocalDb): void {
  const fileName = `apps-db-export-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = href;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}