import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { RoleProvider } from "./providers"
import { AuthProvider } from "@/lib/auth-context"
import { FloatingChatWidget } from "@/components/floating-chat-widget"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "DocuFleet by Segur-ia - Compliance Documental con IA para Transporte",
  description:
    "Automatiza la gestion de 35+ documentos de transporte con IA. Validacion instantanea, 99% accuracy, cero multas. La solucion de Segur-ia para flotas de transporte.",
  generator: "DocuFleet by Segur-ia",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthProvider>
          <RoleProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <FloatingChatWidget />
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
