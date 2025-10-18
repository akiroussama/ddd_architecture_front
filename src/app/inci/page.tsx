import { Metadata } from "next"

import { InciRepository } from "@/components/inci/inci-repository"

export const metadata: Metadata = {
  title: "Référentiel INCI | GeberGuard PLM",
  description:
    "Gestion centralisée des dénominations INCI, annexes réglementaires et sources inventaires avec capacités de tri avancées."
}

export default function InciPage() {
  return (
    <div className="flex min-h-full flex-col">
      <InciRepository />
    </div>
  )
}
