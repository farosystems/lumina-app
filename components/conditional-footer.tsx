"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/ui/footer"

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // No mostrar footer en páginas de login
  const hideFooterPaths = ['/sign-in', '/sign-up']
  const shouldHideFooter = hideFooterPaths.some(path => pathname.startsWith(path))
  
  if (shouldHideFooter) {
    return null
  }
  
  return <Footer />
}







