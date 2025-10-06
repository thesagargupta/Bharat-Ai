import React, { Suspense } from 'react'
import './globals.css'
import TopLoadingBar from '../../components/TopLoadingBar'
import AuthProvider from '../../components/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
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
