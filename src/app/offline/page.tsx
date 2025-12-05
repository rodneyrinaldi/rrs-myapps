// src/app/offline/page.tsx

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-extrabold mb-4">Você está Offline</h1>
      <p className="text-lg text-center">
        Parece que a sua conexão caiu. Recarregue a página quando estiver online.
      </p>
      <p className="text-sm mt-4 text-gray-500">
        Esta página foi pré-armazenada (cached) para acesso offline.
      </p>
    </div>
  );
}