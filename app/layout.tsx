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
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
