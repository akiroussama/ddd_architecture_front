import type { Metadata } from "next"
import { SubstanceManager } from "@/components/substances/substance-manager"

export const metadata: Metadata = {
  title: "Nouvelle Substance | GeberGuard PLM",
  description: "Création d'une nouvelle substance dans le référentiel INCI",
}

export default function ManagerPage() {
  return <SubstanceManager />
}
