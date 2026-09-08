import type React from "react"
import type { Metadata } from "next"
import { GeistSans, GeistMono } from "geist/font"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "CivicReport | Better streets, together",
    template: "%s | CivicReport",
  },
  description: "Report local issues, follow progress, and help your community get things fixed.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased dark`}>
      <body>{children}</body>
    </html>
  )
}
