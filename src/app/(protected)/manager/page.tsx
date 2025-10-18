import type { Metadata } from "next"
import { SubstanceManager } from "@/domains/substances/features/list/components/substance-manager"

export const metadata: Metadata = {
  title: "Nouvelle Substance | GeberGuard PLM",
  description: "Création d'une nouvelle substance dans le référentiel INCI",
}

export default function ManagerPage() {
  return <SubstanceManager />
}
