import type { Metadata } from "next"

import { BlacklistDashboard } from "@/components/blacklists/blacklist-dashboard"
import { mockBlacklists, mockSubstances } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Blacklists | GeberGuard PLM",
  description:
    "Tableau de bord des chartes marques et restrictions marketing pour piloter la formulation."
}

export default function BlacklistsPage() {
  return <BlacklistDashboard blacklists={mockBlacklists} substances={mockSubstances} />
}
