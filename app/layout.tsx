import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { RoleProvider } from "./providers"
import { ToastProvider } from "@/lib/toast-context"
import { ToastContainer } from "@/components/toast-container"
import { DocumentSyncProvider } from "@/contexts/document-sync-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://transn3uralia.vercel.app"
const factoryUrl = "https://n3uralia.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "LABBE",
  title: {
    default: "LABBE | Compliance e inteligencia documental para transporte en Chile",
    template: "%s | LABBE",
  },
  description:
    "Plataforma chilena de compliance para transporte, flotas, transportistas, subcontratistas y conductores. Centraliza evidencia documental, revisión técnica PRT, validaciones externas, alertas y trazabilidad operacional. Desarrollada por N3uralia.",
  keywords: [
    "compliance transporte Chile",
    "gestión documental transporte Chile",
    "revisión técnica PRT Chile",
    "documentos transportistas",
    "compliance flotas",
    "gestión subcontratistas Chile",
    "documentos conductores Chile",
    "inteligencia vehicular Chile",
    "control documental flotas",
    "N3uralia",
  ],
  authors: [{ name: "N3uralia", url: factoryUrl }],
  creator: "N3uralia",
  publisher: "N3uralia",
  category: "Transport compliance software",
  alternates: {
    canonical: "/",
    languages: {
      "es-CL": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    siteName: "LABBE",
    title: "LABBE | Compliance e inteligencia de transporte en Chile",
    description:
      "Evidencia documental, PRT, transportistas, subcontratistas, conductores y compliance operacional en una plataforma trazable desarrollada por N3uralia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LABBE | Compliance e inteligencia de transporte en Chile",
    description:
      "Plataforma de compliance y evidencia operacional para transporte en Chile, desarrollada por N3uralia.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${factoryUrl}/#organization`,
  name: "N3uralia",
  url: factoryUrl,
  description: "AI infrastructure and software engineering company building evidence-driven intelligent platforms.",
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#software`,
  name: "LABBE",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "es-CL",
  areaServed: {
    "@type": "Country",
    name: "Chile",
  },
  description:
    "Plataforma de compliance e inteligencia documental para transporte, flotas, transportistas, subcontratistas y conductores en Chile.",
  creator: {
    "@id": `${factoryUrl}/#organization`,
  },
  publisher: {
    "@id": `${factoryUrl}/#organization`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-CL" className="dark bg-background">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased text-foreground`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, softwareSchema]) }}
        />
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
