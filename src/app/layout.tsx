import type { Metadata } from 'next'
import './globals.css'
import { LayoutShell } from './components/LayoutShell'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'COR-SYS | Executive Dashboard',
  description: 'מערכת ניהול ייעוץ אישית',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;600;700;800&family=Heebo:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#0f172a] text-slate-200 font-[Assistant,sans-serif]">
        <LayoutShell>{children}</LayoutShell>
        <Toaster position="bottom-left" theme="dark" richColors />
      </body>
    </html>
  )
}
