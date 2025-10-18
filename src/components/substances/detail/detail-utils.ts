"use client"

export function formatCurrency(value: number) {
  if (!value) return "—"
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} M€`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} k€`
  }
  return `${value.toFixed(0)} €`
}

export function costComparisonLabel(symbol: "<" | "≈" | ">") {
  if (symbol === "<") return "Coût: ↓"
  if (symbol === ">") return "Coût: ↑"
  return "Coût: ≈"
}

export function costComparisonInsight(symbol: "<" | "≈" | ">") {
  if (symbol === "<") {
    return { tone: "text-emerald-700", message: "Coût inférieur : économies possibles" }
  }
  if (symbol === ">") {
    return { tone: "text-amber-700", message: "Coût supérieur : arbitrage budgétaire" }
  }
  return { tone: "text-slate-700", message: "Coût similaire (±5%)" }
}

export function compatibilityColor(score: number) {
  if (score >= 85) return "text-emerald-600"
  if (score >= 70) return "text-amber-600"
  return "text-rose-600"
}

export function compatibilityHex(score: number) {
  if (score >= 85) return "#059669"
  if (score >= 70) return "#d97706"
  return "#dc2626"
}

export function radialBackground(score: number, color: string) {
  const sanitized = Math.max(0, Math.min(100, score))
  return {
    background: `conic-gradient(${color} ${sanitized}%, #e2e8f0 ${sanitized}% 100%)`
  }
}

export function formatPercentage(value: number | undefined | null) {
  if (value === null || value === undefined) {
    return "—"
  }
  return `${value}%`
}
