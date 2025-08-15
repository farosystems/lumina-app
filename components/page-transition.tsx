"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

// Componente base para transiciones de página
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  )
}

// Componente para transiciones escalonadas
export function StaggeredPageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  )
}

// Componente para transiciones de tarjetas
export function CardTransition({ children, className = "", delay = 0 }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        delay: delay 
      }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  )
}

// Componente para transiciones de listas (NO usar en tablas)
export function ListTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        staggerChildren: 0.1,
      }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  )
}

// Componente para transiciones de elementos de lista (NO usar en tablas)
export function ListItemTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{ duration: 0.3 }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  )
}

// Componentes específicos para tablas que NO usan div
export function TableListTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.tbody
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        staggerChildren: 0.1,
      }}
      className={cn("", className)}
    >
      {children}
    </motion.tbody>
  )
}

export function TableRowTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.tr
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{ duration: 0.3 }}
      className={cn("", className)}
    >
      {children}
    </motion.tr>
  )
}

// Componente para transiciones de elementos de tabla individuales
export function TableItemTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.td
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      transition={{ duration: 0.2 }}
      className={cn("", className)}
    >
      {children}
    </motion.td>
  )
}

