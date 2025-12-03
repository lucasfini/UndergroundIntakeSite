import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Underground Design - Project Request',
  description: 'Submit your design project request to Underground Design',
  icons: {
    icon: '/images/favico.svg',
    shortcut: '/images/favico.svg',
    apple: '/images/favico.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
