"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface GraficoPost {
  dia: string
  posts: number
}

interface PostsChartProps {
  data?: GraficoPost[]
}

export function PostsChart({ data }: PostsChartProps) {
  // Usar datos por defecto si no se proporcionan
  const chartData = data || [
    { dia: "Lun", posts: 0 },
    { dia: "Mar", posts: 0 },
    { dia: "Mié", posts: 0 },
    { dia: "Jue", posts: 0 },
    { dia: "Vie", posts: 0 },
    { dia: "Sáb", posts: 0 },
    { dia: "Dom", posts: 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="posts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
