import React, { Suspense } from 'react'
import './globals.css'
import TopLoadingBar from '../../components/TopLoadingBar'
import AuthProvider from '../../components/AuthProvider'
import PWAInstallPrompt from '../../components/PWAInstallPrompt'
import ServiceWorkerManager from '../../components/ServiceWorkerManager'
import { Toaster } from 'react-hot-toast'

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
        {/* PWA and Mobile App Tags */}
        <meta name="theme-color" content="#ff9933" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bharat AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ff9933" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://thebharatai.vercel.app" />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={null}>
            <TopLoadingBar />
          </Suspense>
          <ServiceWorkerManager />
          {children}
          <PWAInstallPrompt />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                fontFamily: 'inherit',
                fontSize: '14px',
                padding: '14px 20px',
                maxWidth: '500px',
                minWidth: '300px',
                textAlign: 'center',
              },
              success: {
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                style: {
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              loading: {
                style: {
                  background: '#fef3c7',
                  color: '#d97706',
                  border: '1px solid #fde68a',
                },
                iconTheme: {
                  primary: '#f59e0b',
                  secondary: '#fef3c7',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
