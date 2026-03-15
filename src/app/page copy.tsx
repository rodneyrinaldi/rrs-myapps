'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FaSpinner,
  FaExternalLinkAlt,
  FaWhatsapp,
  FaSearch,
  FaFolder,
  FaStar,
  FaRegStar,
  FaThLarge,
  FaList
} from 'react-icons/fa';

// ------------------------------
// Tipos e Constantes
// ------------------------------

interface AppLink {
  name: string;
  title: string;
  link: string;
  category?: string;
}

type SortMode = 'az' | 'za' | 'recent' | 'used';

const DEFAULT_ICON_PATH = '/images/default.png';

// ------------------------------
// Ícone com fallback + SVG silencioso
// ------------------------------

function IconWithFallback({ name }: { name: string }) {
  const [imageSrc, setImageSrc] = useState(DEFAULT_ICON_PATH);

  useEffect(() => {
    const svgPath = `/images/${name.toLowerCase()}.svg`;
    const pngPath = `/images/${name.toLowerCase()}.png`;

    async function loadIcon() {
      try {
        const svg = await fetch(svgPath, { method: 'HEAD' });
        if (svg.ok) {
          setImageSrc(svgPath);
          return;
        }

        const png = await fetch(pngPath, { method: 'HEAD' });
        if (png.ok) {
          setImageSrc(pngPath);
          return;
        }

        setImageSrc(DEFAULT_ICON_PATH);
      } catch {
        setImageSrc(DEFAULT_ICON_PATH);
      }
    }

    loadIcon();
  }, [name]);

  return (
    <Image
      src={imageSrc}
      alt={`${name} Ícone`}
      width={72}
      height={72}
      className="w-4/5 h-4/5 object-contain rounded-xl transition-transform duration-200 group-hover:scale-110"
    />
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

  const [selected, setSelected] = useState<AppLink | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('az');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [usageCount, setUsageCount] = useState<Record<string, number>>({});

  // ------------------------------
  // Carregar dados
  // ------------------------------

  useEffect(() => {
    async function fetchLinks() {
      try {
        const response = await fetch('/apps.json');
        if (!response.ok) throw new Error(`Erro ${response.status} ao carregar apps.json.`);
        const data = await response.json();
        setLinks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();

    const fav = localStorage.getItem('favorites');
    if (fav) setFavorites(JSON.parse(fav));

    const rec = localStorage.getItem('recent');
    if (rec) setRecent(JSON.parse(rec));

    const usage = localStorage.getItem('usageCount');
    if (usage) setUsageCount(JSON.parse(usage));
  }, []);

  // ------------------------------
  // Favoritar
  // ------------------------------

  const toggleFavorite = (name: string) => {
    const updated = favorites.includes(name)
      ? favorites.filter(f => f !== name)
      : [...favorites, name];

    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
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
    localStorage.setItem('usageCount', JSON.stringify(updated));

    const updatedRecent = [name, ...recent.filter(r => r !== name)].slice(0, 10);
    setRecent(updatedRecent);
    localStorage.setItem('recent', JSON.stringify(updatedRecent));
  };

  // ------------------------------
  // Filtragem e ordenação
  // ------------------------------

  const categories = [
    'Todos',
    'Favoritos',
    'Recentes',
    ...Array.from(new Set(links.map(app => app.category || 'Outros')))
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
        Acesso Rápido
      </h1>

      {/* Barra superior */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">

        {/* Busca */}
        <div className="relative w-72">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar app..."
            className="w-full pl-10 pr-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Ordenação */}
        <select
          aria-label="Ordenar aplicativos"
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
        >
          <option value="az">Nome (A–Z)</option>
          <option value="za">Nome (Z–A)</option>
          <option value="recent">Recentes</option>
          <option value="used">Mais usados</option>
        </select>

        {/* Modo de visualização */}
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
        >
          {viewMode === 'grid' ? <FaList /> : <FaThLarge />}
          {viewMode === 'grid' ? 'Lista' : 'Grade'}
        </button>
      </div>

      {/* Categorias */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition
              ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <FaFolder /> {cat}
          </button>
        ))}
      </div>

      {/* Lista ou grade */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 px-6'
            : 'flex flex-col gap-4 px-6'
        }
      >
        {filteredLinks.map((item, index) => (
          <div
            key={index}
            className="relative group cursor-pointer flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
            onClick={() => {
              setSelected(item);
              registerUsage(item.name);
            }}
          >
            {/* Favorito */}
            <div
              className="absolute top-2 right-2 text-yellow-400 text-xl"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.name);
              }}
            >
              {favorites.includes(item.name) ? <FaStar /> : <FaRegStar />}
            </div>

            {/* Ícone */}
            <div className="w-16 h-16 flex items-center justify-center">
              <IconWithFallback name={item.name} />
            </div>

            {/* Texto (modo lista) */}
            {viewMode === 'list' && (
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {item.title}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.category || 'Outros'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <ActionModal
          url={selected.link}
          title={selected.title}
          onClose={() => setSelected(null)}
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
