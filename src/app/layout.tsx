import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'LevelFit — Transforme seus treinos em uma jornada de RPG',
  description: 'Aplicativo de academia gamificado self-service com níveis, XP, conquistas, missões e evolução.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#0b0f19] text-gray-100 selection:bg-amber-500 selection:text-black">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
