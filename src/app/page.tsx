'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';

// --- 1. Definições de Tipos e Constantes ---

interface AppLink {
  name: string;   // usado para imagem
  title: string;  // mostrado na tela
  link: string;   // URL de navegação
}

const DEFAULT_ICON_PATH = '/images/default.png';

// Função auxiliar para formatar o nome do arquivo de ícone
const getIconFileName = (name: string) => {
  return name.toLowerCase() + '.png';
};

// --- 2. Componente de Fallback para Ícones ---

function IconWithFallback({ name }: { name: string }) {
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_ICON_PATH);

  useEffect(() => {
    const specificIconPath = `/images/${getIconFileName(name)}`;

    // Verifica se a imagem existe usando HEAD request
    fetch(specificIconPath, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          setImageSrc(specificIconPath);
        } else {
          setImageSrc(DEFAULT_ICON_PATH);
        }
      })
      .catch(() => setImageSrc(DEFAULT_ICON_PATH));
  }, [name]);

  return (
    <Image
      src={imageSrc}
      alt={`${name} Ícone`}
      width={72}
      height={72}
      className="w-4/5 h-4/5 object-contain rounded-xl" // ocupa 80% do container
      priority={false}
    />
  );
}

// --- 3. Componente Principal da Página ---

export default function AppAccessPage() {
  const [links, setLinks] = useState<AppLink[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const response = await fetch('/apps.json');

        if (!response.ok) {
          throw new Error(`Erro ${response.status} ao carregar apps.json.`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('O arquivo apps.json não é um array válido.');
        }

        setLinks(data as AppLink[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, []);

  const containerClasses =
    'w-full mx-auto md:max-w-[70%] p-6 md:p-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-center'; 
    // <-- alinhamento horizontal ao centro

  const linkItemClasses =
    'flex flex-col items-center justify-start text-center cursor-pointer group';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <FaSpinner className="animate-spin mr-2" /> Carregando links...
      </div>
    );
  }

  if (error || !links || links.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col p-4">
        <p className={`font-bold ${error ? 'text-red-600' : 'text-gray-800'}`}>
          ⚠️ {error ? `Erro: ${error}` : 'Nenhum link configurado em apps.json.'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Verifique o console para detalhes ou o arquivo &apos;apps.json&apos; na pasta
          &apos;public&apos;.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
        Acesso Rápido
      </h1>

      <div className={containerClasses}>
        {links.map((linkItem, index) => (
          <Link
            key={index}
            href={linkItem.link}
            target="_blank"
            rel="noopener noreferrer"
            className={linkItemClasses}
          >
            {/* Ícone */}
            <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white rounded-xl shadow-lg p-3 transition duration-300 group-hover:scale-110 group-hover:shadow-xl border border-gray-200">
              <IconWithFallback name={linkItem.name} />
            </div>

            {/* Nome da Aplicação */}
            <span className="mt-3 text-sm md:text-base font-semibold text-gray-700 max-w-full truncate group-hover:text-blue-600 transition duration-150">
              {linkItem.title}
            </span>
          </Link>
        ))}
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Acesso Centralizado.
      </footer>
    </div>
  );
}
