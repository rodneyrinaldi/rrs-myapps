'use client';

import { useState, useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import {
  FaSpinner,
  FaExternalLinkAlt,
  FaWhatsapp,
  FaSearch,
  FaFolder,
  FaStar,
  FaRegStar,
  FaThLarge,
  FaList,
  FaUpload,
  FaDownload,
  FaSortAlphaDown,
  FaSortAlphaDownAlt,
  FaClock,
  FaFire,
  FaChevronDown,
  FaTags,
  FaLink
} from 'react-icons/fa';
import {
  loadAppsDb,
  saveAppsDb,
  parseImportedDb,
  downloadAppsDb,
  resetAppsDb,
  type AppLink,
  type AppsLocalDb
} from '@/modules/apps/infrastructure/local-db';
  // Reset banco local
  const handleResetDb = () => {
    if (window.confirm('Tem certeza que deseja resetar o banco local? Todos os dados locais serão apagados e restaurados do padrão na próxima visita ou importação.')) {
      resetAppsDb();
      setSyncMessage('Banco local resetado. Ao recarregar ou na próxima visita, o banco será recomposto.');
    }
  };
import { CategoryCrudModal } from '@/modules/apps/presentation/modals/CategoryCrudModal';
import { LinkCrudModal } from '@/modules/apps/presentation/modals/LinkCrudModal';

// ------------------------------
// Tipos e Constantes
// ------------------------------

type SortMode = 'az' | 'za' | 'recent' | 'used';

const CATEGORY_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
  '#EF4444', // Red
  '#84CC16', // Lime
];

// ------------------------------
// Ícone baseado em iniciais
// ------------------------------

function InitialsIcon({
  title,
  color,
  viewMode
}: {
  title: string;
  color: string;
  viewMode: 'grid' | 'list';
}) {
  const initials = title
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded-xl shadow-inner"
      style={{
        width: viewMode === 'grid' ? '64px' : '48px',
        height: viewMode === 'grid' ? '64px' : '48px',
        backgroundColor: color,
        color: 'white',
        fontWeight: 'bold',
        fontSize: viewMode === 'grid' ? '1.5rem' : '1.2rem'
      }}
    >
      {initials}
    </div>
  );
}

// ------------------------------
// Modal de Ações
// ------------------------------

function ActionModal({
  url,
  title,
  onClose
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const openUrl = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const shareWhatsApp = () => {
    const encoded = encodeURIComponent(url);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-80 animate-zoomIn">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
          {title}
        </h2>

        <button
          onClick={openUrl}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold mb-3 hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <FaExternalLinkAlt /> Abrir URL
        </button>

        <button
          onClick={shareWhatsApp}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <FaWhatsapp /> Compartilhar via WhatsApp
        </button>

        <button
          onClick={onClose}
          className="w-full py-2 mt-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ------------------------------
// Página Principal
// ------------------------------

export default function AppAccessPage() {
  const [links, setLinks] = useState<AppLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [selected, setSelected] = useState<AppLink | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('az');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [usageCount, setUsageCount] = useState<Record<string, number>>({});
  const [categoriesCatalog, setCategoriesCatalog] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [dbReady, setDbReady] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [showCategoryCrud, setShowCategoryCrud] = useState(false);
  const [showLinkCrud, setShowLinkCrud] = useState(false);

  const importFileRef = useRef<HTMLInputElement | null>(null);

  // ------------------------------
  // Carregar dados
  // ------------------------------

  useEffect(() => {
    async function initializeLocalDb() {
      try {
        const snapshot = await loadAppsDb();
        setLinks(snapshot.links);
        setCategoriesCatalog(snapshot.categories);
        setCategoryColors(snapshot.categoryColors);
        setFavorites(snapshot.favorites);
        setRecent(snapshot.recent);
        setUsageCount(snapshot.usageCount);
        setDbReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    }

    initializeLocalDb();
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    const snapshot: AppsLocalDb = {
      version: 1,
      links,
      categories: categoriesCatalog,
      categoryColors,
      favorites,
      recent,
      usageCount,
      updatedAt: new Date().toISOString()
    };

    saveAppsDb(snapshot);
  }, [dbReady, links, categoriesCatalog, categoryColors, favorites, recent, usageCount]);

  // ------------------------------
  // Favoritar
  // ------------------------------

  const toggleFavorite = (name: string) => {
    const updated = favorites.includes(name)
      ? favorites.filter(f => f !== name)
      : [...favorites, name];

    setFavorites(updated);
  };

  // ------------------------------
  // Registrar uso
  // ------------------------------

  const registerUsage = (name: string) => {
    const updated = {
      ...usageCount,
      [name]: (usageCount[name] || 0) + 1
    };
    setUsageCount(updated);

    const updatedRecent = [name, ...recent.filter(r => r !== name)].slice(0, 10);
    setRecent(updatedRecent);
  };

  const handleExportDb = () => {
    const snapshot: AppsLocalDb = {
      version: 1,
      links,
      categories: categoriesCatalog,
      categoryColors,
      favorites,
      recent,
      usageCount,
      updatedAt: new Date().toISOString()
    };

    downloadAppsDb(snapshot);
    setSyncMessage('Exportacao concluida com sucesso.');
  };

  const handleSaveCategories = (payload: { categories: string[]; categoryColors: Record<string, string> }) => {
    const { categories: updatedCategories, categoryColors: updatedColors } = payload;

    const updatedLinks = links.map(l => {
      if (l.category && !updatedCategories.includes(l.category)) {
        return { ...l, category: undefined };
      }
      return l;
    });

    setLinks(updatedLinks);
    setCategoriesCatalog(updatedCategories);
    setCategoryColors(updatedColors);
  };

  const handleSaveLinks = (updatedLinks: AppLink[]) => {
    setLinks(updatedLinks);

    const categoriesFromLinks = updatedLinks
      .map(link => link.category)
      .filter((category): category is string => Boolean(category));

    setCategoriesCatalog(prev => Array.from(new Set([...prev, ...categoriesFromLinks])));
  };

  const handleImportDb = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseImportedDb(text);

      setLinks(imported.links);
      setCategoriesCatalog(imported.categories);
      setCategoryColors(imported.categoryColors);
      setFavorites(imported.favorites);
      setRecent(imported.recent);
      setUsageCount(imported.usageCount);
      setActiveCategory('Todos');
      setSearch('');
      setError(null);
      setSyncMessage('Importacao concluida. Banco local atualizado.');
    } catch (err) {
      setSyncMessage(null);
      setError(err instanceof Error ? err.message : 'Falha ao importar arquivo.');
    } finally {
      event.target.value = '';
    }
  };

  // ------------------------------
  // Cores por categoria
  // ------------------------------

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    let index = 0;

    const linkedCategories = links
      .map(link => link.category)
      .filter((category): category is string => Boolean(category));

    const uniqueCategories = Array.from(new Set([...categoriesCatalog, ...linkedCategories, 'Outros']));

    uniqueCategories.forEach(cat => {
      map[cat] = categoryColors[cat] || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      index++;
    });

    return map;
  }, [links, categoriesCatalog, categoryColors]);

  // ------------------------------
  // Filtragem e ordenação
  // ------------------------------

  const categories = [
    'Todos',
    'Favoritos',
    'Recentes',
    ...Array.from(new Set([...categoriesCatalog, ...links.map(app => app.category || 'Outros')]))
  ];

  let filteredLinks = links.filter(app => {
    const matchesSearch =
      app.title.toLowerCase().includes(search.toLowerCase()) ||
      app.name.toLowerCase().includes(search.toLowerCase());

    const category = app.category || 'Outros';

    const matchesCategory =
      activeCategory === 'Todos' ||
      (activeCategory === 'Favoritos' && favorites.includes(app.name)) ||
      (activeCategory === 'Recentes' && recent.includes(app.name)) ||
      category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  filteredLinks = filteredLinks.sort((a, b) => {
    if (sortMode === 'az') return a.title.localeCompare(b.title);
    if (sortMode === 'za') return b.title.localeCompare(a.title);
    if (sortMode === 'recent')
      return (recent.indexOf(a.name) === -1 ? 999 : recent.indexOf(a.name)) -
             (recent.indexOf(b.name) === -1 ? 999 : recent.indexOf(b.name));
    if (sortMode === 'used')
      return (usageCount[b.name] || 0) - (usageCount[a.name] || 0);
    return 0;
  });

  // ------------------------------
  // Renderização
  // ------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <FaSpinner className="animate-spin mr-2" /> Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 flex-col p-4">
        <p className="font-bold text-red-600">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-16 transition">

      <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
        rrs.net.br/myapps
      </h1>

      {/* Busca sempre visível */}
      <div className="flex justify-center mb-2 px-4">
        <div className="relative w-72">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar app..."
            className="w-full pl-10 pr-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Acordeão de controles */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={() => setToolbarOpen(open => !open)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          title={toolbarOpen ? 'Fechar opções' : 'Abrir opções'}
          aria-expanded={toolbarOpen}
        >
          <FaChevronDown
            style={{ transition: 'transform 0.2s', transform: toolbarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {toolbarOpen && (
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {/* Bloco de Ordenação e Visualização */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 shadow">
              {([
                { mode: 'az',     icon: <FaSortAlphaDown />,    label: 'Nome A–Z' },
                { mode: 'za',     icon: <FaSortAlphaDownAlt />, label: 'Nome Z–A' },
                { mode: 'recent', icon: <FaClock />,             label: 'Recentes' },
                { mode: 'used',   icon: <FaFire />,              label: 'Mais usados' },
              ] as const).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  title={label}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border transition ${
                    sortMode === mode
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-indigo-400 text-indigo-600 bg-white hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-800'
                  }`}
                >
                  {icon}
                </button>
              ))}
              <span className="w-px h-8 bg-indigo-300 dark:bg-indigo-700 mx-1" />
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                title={viewMode === 'grid' ? 'Modo lista' : 'Modo grade'}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-indigo-400 text-indigo-600 bg-white hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-800 transition"
              >
                {viewMode === 'grid' ? <FaList /> : <FaThLarge />}
              </button>
            </div>

            {/* Bloco de Importação/Exportação */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 shadow">
              <button
                onClick={handleExportDb}
                title="Exportar banco local"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-400 text-blue-600 bg-white hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-800 transition"
              >
                <FaDownload />
              </button>
              <button
                onClick={() => importFileRef.current?.click()}
                title="Importar banco local"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-400 text-blue-600 bg-white hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-800 transition"
              >
                <FaUpload />
              </button>
              <input
                ref={importFileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportDb}
              />
            </div>

            {/* Bloco de Gerenciamento */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 shadow">
              <button
                onClick={() => setShowCategoryCrud(true)}
                title="Gerenciar categorias"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-green-400 text-green-600 bg-white hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-800 transition"
              >
                <FaTags />
              </button>
              <button
                onClick={() => setShowLinkCrud(true)}
                title="Gerenciar links"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-green-400 text-green-600 bg-white hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-800 transition"
              >
                <FaLink />
              </button>
            </div>

            {/* Bloco de Reset */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 shadow">
              <button
                onClick={handleResetDb}
                title="Resetar banco local"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-red-400 text-red-600 bg-white hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-800 transition"
              >
                <span className="text-lg font-bold">⟳</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {syncMessage && (
        <p className="text-center text-sm text-green-700 dark:text-green-300 mb-6">
          {syncMessage}
        </p>
      )}

      {/* Categorias */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {categories.map((cat, index) => {
          const isSpecial = ['Todos', 'Favoritos', 'Recentes'].includes(cat);
          const color = isSpecial ? '#6B7280' : categoryColorMap[cat] || '#999';
          const isActive = activeCategory === cat;

          return (
            <button
              key={index}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition shadow"
              style={{
                backgroundColor: isActive ? color : `${color}22`,
                color: isActive ? 'white' : color,
                border: `1px solid ${color}55`
              }}
            >
              <FaFolder />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Lista ou grade */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 px-6'
            : 'flex flex-col gap-4 px-6'
        }
      >
        {filteredLinks.map((item, index) => {
          const color = categoryColorMap[item.category || 'Outros'];

          return (
            <div
              key={index}
              className={
                viewMode === 'grid'
                  ? 'flex flex-col items-center justify-center p-3 rounded-xl shadow hover:shadow-lg transition cursor-pointer'
                  : 'relative group cursor-pointer flex items-center gap-4 p-3 rounded-xl shadow hover:shadow-lg transition'
              }
              style={{
                backgroundColor: `${color}22`,
                border: `1px solid ${color}55`,
                ...(viewMode === 'grid' && {
                  width: '100%',
                  aspectRatio: '1 / 1'
                })
              }}
              onClick={() => {
                setSelected(item);
                registerUsage(item.name);
              }}
            >
              {/* Favorito */}
              {viewMode === 'list' && (
                <div
                  className="absolute top-2 right-2 text-yellow-400 text-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.name);
                  }}
                >
                  {favorites.includes(item.name) ? <FaStar /> : <FaRegStar />}
                </div>
              )}

              {/* Ícone */}
              <InitialsIcon
                title={item.title}
                color={color}
                viewMode={viewMode}
              />

              {/* Texto */}
              {viewMode === 'list' ? (
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {item.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.category || 'Outros'}
                  </span>
                </div>
              ) : (
                <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {item.title}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de ação */}
      {selected && (
        <ActionModal
          url={selected.link}
          title={selected.title}
          onClose={() => setSelected(null)}
        />
      )}

      {/* CRUD Categorias */}
      {showCategoryCrud && (
        <CategoryCrudModal
          categories={categoriesCatalog}
          categoryColors={categoryColors}
          availableColors={CATEGORY_COLORS}
          onSave={handleSaveCategories}
          onClose={() => setShowCategoryCrud(false)}
        />
      )}

      {/* CRUD Links */}
      {showLinkCrud && (
        <LinkCrudModal
          links={links}
          categories={categoriesCatalog}
          categoryColors={categoryColorMap}
          onSave={handleSaveLinks}
          onClose={() => setShowLinkCrud(false)}
        />
      )}

      <footer className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Acesso Centralizado.
      </footer>

      {/* Animações */}
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        .animate-zoomIn {
          animation: zoomIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes zoomIn {
          from { transform: scale(0.85); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
