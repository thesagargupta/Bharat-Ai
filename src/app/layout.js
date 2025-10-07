import React, { Suspense } from 'react'
import './globals.css'
import TopLoadingBar from '../../components/TopLoadingBar'
import AuthProvider from '../../components/AuthProvider'

export const metadata = {
  metadataBase: new URL('https://thebharatai.vercel.app'),
  title: {
    default: 'Bharat AI - Advanced AI Assistant Made in India',
    template: '%s | Bharat AI'
  },
  description: 'Bharat AI is an advanced artificial intelligence assistant developed in India. Experience powerful AI chat, image analysis, web search, and intelligent tools. Free AI chatbot with Google and GitHub authentication.',
  keywords: [
    'Bharat AI',
    'Indian AI',
    'AI assistant',
    'artificial intelligence India',
    'AI chatbot',
    'free AI chat',
    'AI tools India',
    'machine learning',
    'Indian chatbot',
    'AI made in India',
    'conversational AI',
    'intelligent assistant',
    'web search AI',
    'image analysis AI',
    'Sagar Gupta AI',
    'Indian technology',
    'AI innovation India'
  ],
  authors: [{ name: 'Sagar Gupta' }],
  creator: 'Sagar Gupta',
  publisher: 'Bharat AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://thebharatai.vercel.app',
    title: 'Bharat AI - Advanced AI Assistant Made in India',
    description: 'Experience the power of Indian AI innovation. Bharat AI offers intelligent chat, image analysis, web search, and more. Free to use with secure authentication.',
    siteName: 'Bharat AI',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Bharat AI - Indian Artificial Intelligence Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bharat AI - Advanced AI Assistant Made in India',
    description: 'Experience the power of Indian AI innovation. Intelligent chat, image analysis, and powerful AI tools.',
    images: ['/logo.png'],
    creator: '@thesagargupta',
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
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code', // Replace with actual Google Search Console verification
  },
  alternates: {
    canonical: 'https://thebharatai.vercel.app',
  },
  category: 'technology',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Additional SEO Tags */}
        <meta name="theme-color" content="#ff9933" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="canonical" href="https://thebharatai.vercel.app" />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={null}>
            <TopLoadingBar />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
