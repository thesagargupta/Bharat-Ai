import React, { Suspense } from 'react'
import './globals.css'
import TopLoadingBar from '../../components/TopLoadingBar'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
