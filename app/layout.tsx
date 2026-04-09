import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NoStringsSplit — Split bills, not friendships',
  description: 'The easiest way to split expenses with your friends. No awkwardness, no spreadsheets.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="bg-[#0f0f14] text-zinc-100 antialiased font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}
