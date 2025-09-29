"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/sections/hero-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProblemTab } from "@/components/sections/problem-tab"
import { SolutionTab } from "@/components/sections/solution-tab"
import { DemoTab } from "@/components/sections/demo-tab"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("problema")

  useEffect(() => {
    // Check URL hash on page load
    const hash = window.location.hash.replace("#", "")
    if (hash === "solucion" || hash === "problema" || hash === "demo") {
      setActiveTab(hash)
      // Scroll to tabs section after a short delay
      setTimeout(() => {
        const tabsSection = document.getElementById("tabs-section")
        if (tabsSection) {
          tabsSection.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash === "solucion" || hash === "problema" || hash === "demo") {
        setActiveTab(hash)
        const tabsSection = document.getElementById("tabs-section")
        if (tabsSection) {
          tabsSection.scrollIntoView({ behavior: "smooth" })
        }
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    window.history.pushState(null, "", `#${value}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />

        <section id="tabs-section" className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
                <TabsTrigger value="problema">El Problema</TabsTrigger>
                <TabsTrigger value="solucion">La Solución</TabsTrigger>
                <TabsTrigger value="demo">Ver Demo</TabsTrigger>
              </TabsList>

              <TabsContent value="problema">
                <ProblemTab />
              </TabsContent>

              <TabsContent value="solucion">
                <SolutionTab />
              </TabsContent>

              <TabsContent value="demo">
                <DemoTab />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
