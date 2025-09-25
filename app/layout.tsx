import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-SaaS Boilerplate',
  description: 'Production-ready AI-SaaS boilerplate with Next.js, Supabase, TypeScript, and Tailwind',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}