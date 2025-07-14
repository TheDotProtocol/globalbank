import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/hooks/useToast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GlobalBank - Digital Banking Platform',
  description: 'Modern digital banking with AI-powered assistance, secure transactions, and comprehensive financial services.',
  keywords: 'digital banking, online banking, financial services, AI assistant, secure banking',
  authors: [{ name: 'GlobalBank Team' }],
  creator: 'GlobalBank',
  publisher: 'GlobalBank',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://globalbank.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GlobalBank - Digital Banking Platform',
    description: 'Modern digital banking with AI-powered assistance, secure transactions, and comprehensive financial services.',
    url: 'https://globalbank.com',
    siteName: 'GlobalBank',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GlobalBank Digital Banking Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalBank - Digital Banking Platform',
    description: 'Modern digital banking with AI-powered assistance, secure transactions, and comprehensive financial services.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
