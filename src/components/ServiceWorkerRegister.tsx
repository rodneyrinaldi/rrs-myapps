// src/components/ServiceWorkerRegister.tsx
'use client';
    
import { useEffect } from 'react';

const ServiceWorkerRegister = () => {
  useEffect(() => {
    // Registra apenas em ambiente de produção para evitar conflitos no dev server
    if (process.env.NODE_ENV !== 'development' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        // Registra no caminho /sw.js, conforme configurado em next.config.ts
        .register('/sw.js', { scope: '/' }) 
        .then((registration) => {
          console.log('Service Worker Serwist registrado com sucesso:', registration.scope);
        })
        .catch((error) => {
          console.error('Falha no registro do Service Worker Serwist:', error);
        });
    }
  }, []);

  return null; 
};

export default ServiceWorkerRegister;