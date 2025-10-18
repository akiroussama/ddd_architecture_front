"use client"

import type { Restriction } from "@/types"
import type { ScenarioStatus } from "./detail-constants"

export interface ComplianceSnapshot {
  forbidden: Restriction[]
  regulated: Restriction[]
  listed: Restriction[]
  unlisted: Restriction[]
  highestSeverity: Restriction["type"]
  total: number
}

export interface MarketingSummary {
  hardBans: number
  limited: number
  monitoring: number
}

export interface DossierChecklistItem {
  label: string
  completed: boolean
  helper: string
}

export interface ScenarioResult {
  country: string
  status: ScenarioStatus
  message: string
  maxPercentage: number | null
  margin: number | null
  references: string[]
}
