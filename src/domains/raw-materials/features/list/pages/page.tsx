import type { Metadata } from "next"
import { RawMaterialsList } from "@/domains/raw-materials/features/list/components/raw-materials-list"

export const metadata: Metadata = {
  title: "Matières Premières | GeberGuard PLM",
  description: "Gestion des matières premières par site de production",
}

export default function RawMaterialsPage() {
  return <RawMaterialsList />
}
