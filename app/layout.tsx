import type React from "react"
import type { Metadata } from "next"
import { Montserrat, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { RoleProvider } from "./providers"
import { ToastProvider } from "@/lib/toast-context"
import { ToastContainer } from "@/components/toast-container"
import { DocumentSyncProvider } from "@/contexts/document-sync-context"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "ChileFlota | Control operacional y compliance documental",
  description:
    "Plataforma operacional para gestionar documentación, cumplimiento, conductores, transportistas y alertas de flota.",
  generator: "ChileFlota",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark bg-background">
      <body className={`font-sans ${montserrat.variable} ${jetbrainsMono.variable} antialiased text-foreground`}>
        <DocumentSyncProvider>
          <RoleProvider>
            <ToastProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <ToastContainer />
            </ToastProvider>
          </RoleProvider>
        </DocumentSyncProvider>
      </body>
    </html>
  )
}
