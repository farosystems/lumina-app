import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/ui/footer"
import { ClerkProvider } from '@clerk/nextjs'
import { RouteGuard } from "@/components/route-guard"
import { ConditionalFooter } from "@/components/conditional-footer"
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Lumina - Ilumina tu marca con contenido inteligente",
  description:
    "Genera contenido de redes sociales con IA para tu empresa. Publicación automática en Instagram y Facebook.",
  generator: "Lumina",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${inter.variable} ${montserrat.variable} antialiased`}>
        <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
          <RouteGuard>
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </RouteGuard>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
