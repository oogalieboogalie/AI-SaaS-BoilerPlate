import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { SoundProvider } from '@/components/sound-provider'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI-SaaS Boilerplate',
  description:
    'Production-ready AI-SaaS boilerplate with Next.js, Supabase, TypeScript, and Tailwind',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SoundProvider>{children}</SoundProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
