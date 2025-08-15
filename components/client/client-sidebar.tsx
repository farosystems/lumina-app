"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, History, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Generar Post",
    href: "/dashboard/generate",
    icon: Plus,
  },
  {
    name: "Historial",
    href: "/dashboard/history",
    icon: History,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function ClientSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:block hidden">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/logo.png" alt="Lumina AI" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-heading font-bold">Lumina</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-purple-600 text-white hover:bg-purple-700 hover:text-white",
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Company Info */}
        <div className="px-4 py-4 border-t border-border">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">Cafetería Luna</div>
            <div className="text-xs text-muted-foreground">Gastronomía</div>
          </div>
        </div>
      </div>
    </div>
  )
}
