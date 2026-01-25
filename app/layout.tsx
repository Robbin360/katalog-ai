import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

// Configuración de Fuentes (Vienen por defecto en Next.js 15)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadatos para Google y compartir links
export const metadata: Metadata = {
  title: "Katalog AI | Autonomous Foundry",
  description: "Transform product images into high-conversion assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. suppressHydrationWarning: Evita errores si el navegador traduce
    // 2. lang="en": Define el idioma base
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        {/* Envolvemos toda la app con el Provider de Datos */}
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
