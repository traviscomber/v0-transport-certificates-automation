import { Building2, LogOut, LayoutDashboard, TrendingUp, Truck, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const navItems = [
  { href: "/mandante", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mandante/subcontratistas", label: "Subcontratistas", icon: Truck },
  { href: "/mandante/compliance", label: "Compliance", icon: AlertCircle },
  { href: "/mandante/reportes", label: "Reportes", icon: TrendingUp },
]

export default async function MandanteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <aside className="w-64 border-r border-[#E4E4E7] bg-white p-6">
        <div className="mb-8 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#0066FF]" />
          <span className="font-bold text-[#18181B]">DocuFleet</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#F4F4F5] text-[#71717A]"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="border-b border-[#E4E4E7] bg-white px-8 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-[#18181B]">Panel Mandante</h1>
          <button className="text-sm text-[#71717A] hover:text-[#18181B]">
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
