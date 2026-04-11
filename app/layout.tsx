import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Transportes Labbe - Portal Empresarial de Automatización",
  description:
    "Portal integral de Transportes Labbe para gestión automatizada de certificados F-30, cumplimiento normativo y documentación de transporte. Automatización 100%, cumplimiento total.",
  generator: "Transportes Labbe",
  keywords: "Transportes Labbe, F-30, automatización, cumplimiento normativo, gestión documental",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
