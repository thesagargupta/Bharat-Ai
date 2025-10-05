import React from 'react'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {children}
      </body>
    </html>
  )
}
