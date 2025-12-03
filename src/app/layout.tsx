// app/layout.tsx

// A sintaxe da primeira linha é muito sensível
import type { Metadata } from "next"; 

// Certifique-se de que há vírgula entre Geist e Geist_Mono, e a palavra 'from'
import { Geist, Geist_Mono } from "next/font/google"; 

import "./globals.css";

// O erro 1005 estava quase certamente entre a linha 1 e 3.
// O restante do código deve estar correto:

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rodney Rinaldi | Advogado",
  description: "Rodney Rinaldi Advogado Especialista em Tecnologia e Negócios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}