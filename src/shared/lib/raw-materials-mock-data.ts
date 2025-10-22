import type {
  Site,
  Company,
  RawMaterial,
  RMStatus,
  RegulatoryNote,
  NoteAttachment,
  CasEcPair,
} from "@/shared/types"

// Sites with specific code patterns
export const mockSites: Site[] = [
  {
    id: "site-1",
    code: "FR-PAR",
    name: "Paris Production",
    location: "Paris",
    country: "France",
    codePattern: "PAR-{year}-{seq}",
    active: true,
  },
  {
    id: "site-2",
    code: "FR-LYO",
    name: "Lyon Manufacturing",
    location: "Lyon",
    country: "France",
    codePattern: "LYO-{year}-{seq}",
    active: true,
  },
  {
    id: "site-3",
    code: "US-NJ",
    name: "New Jersey Facility",
    location: "Somerset, NJ",
    country: "USA",
    codePattern: "NJ-{year}-{seq}",
    active: true,
  },
  {
    id: "site-4",
    code: "DE-BER",
    name: "Berlin R&D Center",
    location: "Berlin",
    country: "Germany",
    codePattern: "BER-{year}-{seq}",
    active: true,
  },
  {
    id: "site-5",
    code: "CN-SHA",
    name: "Shanghai Plant",
    location: "Shanghai",
    country: "China",
    codePattern: "SHA-{year}-{seq}",
    active: true,
  },
]

// 20+ Major suppliers/manufacturers
export const mockCompanies: Company[] = [
  {
    id: "comp-1",
    name: "BASF",
    type: "both",
    country: "Germany",
    email: "contact@basf.com",
  },
  {
    id: "comp-2",
    name: "Croda International",
    type: "supplier",
    country: "UK",
    email: "info@croda.com",
  },
  {
    id: "comp-3",
    name: "Evonik Industries",
    type: "manufacturer",
    country: "Germany",
    email: "contact@evonik.com",
  },
  {
    id: "comp-4",
    name: "Solvay",
    type: "both",
    country: "Belgium",
    email: "info@solvay.com",
  },
  {
    id: "comp-5",
    name: "L'Oréal Active Cosmetics",
    type: "manufacturer",
    country: "France",
    email: "contact@loreal.com",
  },
  {
    id: "comp-6",
    name: "Dow Chemical",
    type: "supplier",
    country: "USA",
    email: "orders@dow.com",
  },
  {
    id: "comp-7",
    name: "Ashland Global",
    type: "supplier",
    country: "USA",
    email: "info@ashland.com",
  },
  {
    id: "comp-8",
    name: "DSM Nutritional Products",
    type: "manufacturer",
    country: "Netherlands",
    email: "contact@dsm.com",
  },
  {
    id: "comp-9",
    name: "Clariant",
    type: "supplier",
    country: "Switzerland",
    email: "info@clariant.com",
  },
  {
    id: "comp-10",
    name: "Lonza Group",
    type: "both",
    country: "Switzerland",
    email: "contact@lonza.com",
  },
  {
    id: "comp-11",
    name: "Symrise AG",
    type: "supplier",
    country: "Germany",
    email: "info@symrise.com",
  },
  {
    id: "comp-12",
    name: "Givaudan",
    type: "supplier",
    country: "Switzerland",
    email: "contact@givaudan.com",
  },
  {
    id: "comp-13",
    name: "SEPPIC (Air Liquide)",
    type: "manufacturer",
    country: "France",
    email: "info@seppic.com",
  },
  {
    id: "comp-14",
    name: "Gattefossé",
    type: "supplier",
    country: "France",
    email: "contact@gattefosse.com",
  },
  {
    id: "comp-15",
    name: "Lubrizol",
    type: "manufacturer",
    country: "USA",
    email: "info@lubrizol.com",
  },
  {
    id: "comp-16",
    name: "Wacker Chemie",
    type: "supplier",
    country: "Germany",
    email: "contact@wacker.com",
  },
  {
    id: "comp-17",
    name: "Eastman Chemical",
    type: "both",
    country: "USA",
    email: "info@eastman.com",
  },
  {
    id: "comp-18",
    name: "Arkema",
    type: "supplier",
    country: "France",
    email: "contact@arkema.com",
  },
  {
    id: "comp-19",
    name: "Momentive Performance Materials",
    type: "manufacturer",
    country: "USA",
    email: "info@momentive.com",
  },
  {
    id: "comp-20",
    name: "Shin-Etsu Chemical",
    type: "supplier",
    country: "Japan",
    email: "contact@shinetsu.co.jp",
  },
  {
    id: "comp-21",
    name: "KCC Corporation",
    type: "manufacturer",
    country: "South Korea",
    email: "info@kccworld.co.kr",
  },
  {
    id: "comp-22",
    name: "Nouryon",
    type: "supplier",
    country: "Netherlands",
    email: "contact@nouryon.com",
  },
]

// 50+ Realistic INCI names
export const mockInciNames: string[] = [
  "AQUA",
  "GLYCERIN",
  "SODIUM LAURYL SULFATE",
  "CETYL ALCOHOL",
  "STEARYL ALCOHOL",
  "BUTYROSPERMUM PARKII BUTTER",
  "TOCOPHERYL ACETATE",
  "RETINOL",
  "NIACINAMIDE",
  "HYALURONIC ACID",
  "PARFUM",
  "DIMETHICONE",
  "CYCLOPENTASILOXANE",
  "PHENOXYETHANOL",
  "METHYLPARABEN",
  "PROPYLPARABEN",
  "CITRIC ACID",
  "SODIUM HYDROXIDE",
  "XANTHAN GUM",
  "CARBOMER",
  "ACRYLATES COPOLYMER",
  "PEG-100 STEARATE",
  "CETEARYL ALCOHOL",
  "CETEARETH-20",
  "GLYCERYL STEARATE",
  "CAPRYLIC/CAPRIC TRIGLYCERIDE",
  "ISOPROPYL MYRISTATE",
  "PANTHENOL",
  "ALLANTOIN",
  "BISABOLOL",
  "CAFFEINE",
  "SALICYLIC ACID",
  "BENZOYL PEROXIDE",
  "ASCORBIC ACID",
  "ALPHA-TOCOPHEROL",
  "UBIQUINONE",
  "CERAMIDE NP",
  "SODIUM HYALURONATE",
  "HYDROLYZED COLLAGEN",
  "PALMITOYL PENTAPEPTIDE-4",
  "ACETYL HEXAPEPTIDE-8",
  "PROPANEDIOL",
  "BUTYLENE GLYCOL",
  "PENTYLENE GLYCOL",
  "CAPRYLYL GLYCOL",
  "ETHYLHEXYLGLYCERIN",
  "DISODIUM EDTA",
  "TETRASODIUM EDTA",
  "SODIUM BENZOATE",
  "POTASSIUM SORBATE",
  "BHT",
  "BHA",
  "TOCOPHEROL",
  "LIMONENE",
  "LINALOOL",
  "CITRAL",
  "GERANIOL",
  "BENZYL ALCOHOL",
  "BENZYL SALICYLATE",
  "COUMARIN",
  "ALPHA-ISOMETHYL IONONE",
]

// Helper functions
function generateSiteCode(site: Site, index: number): string {
  const year = new Date().getFullYear()
  const seq = String(index).padStart(3, "0")
  return site.codePattern.replace("{year}", String(year)).replace("{seq}", seq)
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomStatus(): RMStatus {
  const statuses: RMStatus[] = [
    "Actif",
    "Approuvé",
    "En attente",
    "En revue",
    "Arrêté",
    "Restreint",
  ]
  const weights = [40, 25, 12, 10, 5, 8]
  const total = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * total

  for (let i = 0; i < statuses.length; i++) {
    random -= weights[i]
    if (random <= 0) return statuses[i]
  }

  return "active"
}

function randomDate(daysBack: number): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  return date.toISOString()
}

function futureDate(daysAhead: number): string {
  const date = new Date()
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead))
  return date.toISOString()
}

// Commercial names generator
const commercialPrefixes = [
  "Ultra", "Pro", "Max", "Pure", "Bio", "Eco", "Natural", "Premium",
  "Active", "Soft", "Gentle", "Rich", "Intense", "Light", "Deep"
]

const commercialMidwords = [
  "Moisture", "Hydra", "Glow", "Smooth", "Firm", "Bright", "Clear",
  "Care", "Guard", "Shield", "Lift", "Tone", "Restore", "Renew"
]

const commercialSuffixes = [
  "Plus", "Complex", "Blend", "System", "Formula", "Extract", "Oil",
  "Serum", "Cream", "Base", "Matrix", "Active", "Essence", "Concentrate"
]

function generateCommercialName(): string {
  const usePrefix = Math.random() > 0.3
  const useMidword = Math.random() > 0.2
  const useSuffix = Math.random() > 0.4

  let name = ""
  if (usePrefix) name += randomItem(commercialPrefixes) + " "
  if (useMidword) name += randomItem(commercialMidwords) + " "
  if (useSuffix) name += randomItem(commercialSuffixes)

  return name.trim() || "Premium Care Formula"
}

const SOURCE_CHOICES = ["CosIng 2014", "Supplier CoA", "ECHA", "IFRA 51e", "Internal QA"]

const riskBadges = [
  "Allergène 26",
  "CMR Suspecté",
  "IFRA restreint",
  "Sensibilisant",
  "Interne - Alerte qualité",
]

const allergenPool = ["Limonene", "Linalool", "Citral", "Geraniol", "Coumarin", "Benzyl Alcohol"]
const ifraCategories = ["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5", "Cat 6"]

function uniqueId(prefix: string, index: number): string {
  const random = Math.random().toString(36).slice(2, 10)
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID()
    } catch {
      /* noop fallback to composed id */
    }
  }
  return `${prefix}-${index}-${random}`
}

function generateCasNumber(): string {
  const part1Length = Math.floor(Math.random() * 5) + 2 // 2 - 7 digits
  let part1 = ""
  for (let i = 0; i < part1Length; i++) {
    const digit = Math.floor(Math.random() * 10)
    part1 += i === 0 && digit === 0 ? digit + 1 : digit
  }

  const part2 = String(Math.floor(Math.random() * 100)).padStart(2, "0")
  const digits = `${part1}${part2}`.split("").reverse()
  const checksum =
    digits.reduce((total, digit, index) => total + Number(digit) * (index + 1), 0) % 10

  return `${part1}-${part2}-${checksum}`
}

function generateEcNumber(): string {
  const part1 = String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")
  const part2 = String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")
  const part3 = String(Math.floor(Math.random() * 10))
  return `${part1}-${part2}-${part3}`
}

function pickSources(): string[] {
  const count = 1 + Math.floor(Math.random() * Math.min(3, SOURCE_CHOICES.length))
  const shuffled = [...SOURCE_CHOICES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function randomSubset<T>(source: T[], max = source.length, min = 0): T[] {
  if (!source.length || max === 0) return []
  const upper = Math.min(max, source.length)
  const lower = Math.min(min, upper)
  const count = Math.max(lower, Math.floor(Math.random() * (upper + 1)))
  if (count === 0) return []
  const clone = [...source]
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone.slice(0, count)
}

function generateCasPairs(inci: string, index: number): CasEcPair[] {
  const upperInci = inci.toUpperCase()
  if (upperInci === "TOCOPHEROL") {
    return [
      {
        id: uniqueId("cas", index),
        cas: "10191-41-0",
        ec: "233-466-0",
        sources: ["CosIng 2014"],
        note: "Profil vitamine E naturelle",
      },
      {
        id: uniqueId("cas", index + 1000),
        cas: "10191-41-0",
        ec: "240-747-1",
        sources: ["CosIng 2014"],
      },
    ]
  }

  if (upperInci === "GERANIOL") {
    return [
      {
        id: uniqueId("cas", index),
        cas: "97-47-4",
        ec: "960-99-5",
        sources: ["CosIng 2014", "Supplier CoA"],
        note: "Conforme réglementation UE parfum",
      },
    ]
  }

  const pairCount = 1 + Math.floor(Math.random() * 2)
  const pairs: CasEcPair[] = []
  const seen = new Set<string>()

  while (pairs.length < pairCount) {
    const cas = generateCasNumber()
    if (seen.has(cas)) continue
    seen.add(cas)
    pairs.push({
      id: uniqueId("cas", index + pairs.length),
      cas,
      ec: Math.random() > 0.4 ? generateEcNumber() : undefined,
      sources: pickSources(),
      note: Math.random() > 0.8 ? "Synchroniser avec IFRA prochaine révision." : undefined,
    })
  }

  return pairs
}

// Realistic conversation templates for different raw materials scenarios
const conversationTemplates = [
  {
    // Glycerin quality issue discussion
    scenario: "quality_concern",
    notes: [
      {
        author: "Sophie Dubois",
        content: "⚠️ Alerte qualité sur le dernier lot de glycérine reçu (LOT-GL2024-047). Les tests de viscosité montrent des valeurs 15% inférieures aux spécifications. Avez-vous rencontré le même problème sur vos sites ?",
        daysAgo: 12,
        attachments: [
          { name: "Rapport_Analyse_LOT-GL2024-047.pdf", type: "pdf" as const, size: "2.3 MB" },
          { name: "Courbe_Viscosité_Comparaison.xlsx", type: "excel" as const, size: "456 KB" }
        ]
      },
      {
        author: "Marc Lefebvre",
        content: "Bonjour Sophie, effectivement nous avons les mêmes résultats à Lyon. J'ai contacté le fournisseur ce matin, ils reconnaissent un problème de process sur leur ligne 3. Ils nous proposent un avoir et un remplacement sous 10 jours.",
        daysAgo: 12,
        attachments: [
          { name: "Email_Fournisseur_BASF.pdf", type: "pdf" as const, size: "124 KB" }
        ]
      },
      {
        author: "Claire Martin",
        content: "J'ai vérifié nos stocks - nous avons encore 3 tonnes du lot précédent (LOT-GL2024-041) qui est conforme. On peut utiliser celui-ci en attendant le remplacement. Par contre, il faut absolument bloquer le lot défectueux dans SAP.",
        daysAgo: 11,
        attachments: [
          { name: "Inventaire_Glycerine_Sites.xlsx", type: "excel" as const, size: "89 KB" }
        ]
      },
      {
        author: "Thomas Rousseau",
        content: "Blocage effectué dans SAP pour tous les sites. J'ai aussi mis à jour la fiche matière avec une note d'alerte. Le fournisseur nous envoie les résultats d'analyse du nouveau lot demain.",
        daysAgo: 11
      },
      {
        author: "Sophie Dubois",
        content: "Parfait ! Merci à tous. Claire, peux-tu organiser le retour du lot défectueux ? Marc, tiens-nous au courant dès réception des nouvelles analyses. Je mets ce dossier en suivi hebdomadaire.",
        daysAgo: 10
      },
      {
        author: "Marc Lefebvre",
        content: "✅ Nouveau lot reçu et analysé (LOT-GL2024-053). Toutes les spécifications sont OK. Certificat d'analyse en PJ. On peut relancer la production.",
        daysAgo: 3,
        attachments: [
          { name: "COA_LOT-GL2024-053.pdf", type: "pdf" as const, size: "1.8 MB" },
          { name: "Validation_QC_Lyon.pdf", type: "pdf" as const, size: "892 KB" }
        ]
      }
    ]
  },
  {
    // New supplier evaluation
    scenario: "supplier_evaluation",
    notes: [
      {
        author: "Isabelle Bernard",
        content: "Bonjour à tous, nous évaluons un nouveau fournisseur pour notre acide hyaluronique : Shin-Etsu Chemical (Japon). Prix très compétitif (-22% vs fournisseur actuel) mais il faut valider la qualité. Qui peut participer aux tests comparatifs ?",
        daysAgo: 28,
        attachments: [
          { name: "Offre_Commerciale_Shin-Etsu.pdf", type: "pdf" as const, size: "3.2 MB" },
          { name: "Comparatif_Prix_Fournisseurs.xlsx", type: "excel" as const, size: "234 KB" }
        ]
      },
      {
        author: "Antoine Mercier",
        content: "Je peux faire les tests de stabilité et compatibilité sur nos formules anti-âge. Il me faudrait 500g d'échantillon. Par contre, avons-nous vérifié leurs certifications COSMOS et ISO 22716 ?",
        daysAgo: 27
      },
      {
        author: "Isabelle Bernard",
        content: "Excellente question Antoine. J'ai demandé tous les certificats - ils ont ISO 9001, ISO 14001 et GMP. Par contre pas encore de COSMOS, c'est en cours chez eux (prévu Q2 2025). Ça pose problème pour nos gammes bio ?",
        daysAgo: 27,
        attachments: [
          { name: "Certificats_ISO_Shin-Etsu.pdf", type: "pdf" as const, size: "4.1 MB" },
          { name: "Audit_Fournisseur_Rapport.pdf", type: "pdf" as const, size: "2.8 MB" }
        ]
      },
      {
        author: "Marie Durand",
        content: "Pour les gammes bio c'est bloquant, on ne peut pas utiliser. Mais on peut démarrer avec les gammes conventionnelles en attendant leur certification COSMOS. J'ai fait une matrice des formules compatibles, voir fichier joint.",
        daysAgo: 26,
        attachments: [
          { name: "Matrice_Formules_Compatibilité.xlsx", type: "excel" as const, size: "156 KB" }
        ]
      },
      {
        author: "Antoine Mercier",
        content: "Tests terminés ! Résultats très satisfaisants. La qualité est équivalente voire légèrement supérieure au fournisseur actuel. Stabilité OK sur 6 mois en conditions accélérées. Photos microscopie et spectres FTIR en pièces jointes.",
        daysAgo: 15,
        attachments: [
          { name: "Rapport_Tests_Comparatifs.pdf", type: "pdf" as const, size: "5.7 MB" },
          { name: "Photos_Microscopie.zip", type: "image" as const, size: "12.3 MB" },
          { name: "Spectres_FTIR_Comparaison.xlsx", type: "excel" as const, size: "678 KB" }
        ]
      },
      {
        author: "Isabelle Bernard",
        content: "🎉 Excellent travail Antoine ! Je lance la procédure de référencement. On démarre avec une commande test de 50kg pour valider le process logistique. Réunion de validation prévue vendredi avec la direction des achats.",
        daysAgo: 14
      }
    ]
  },
  {
    // Regulatory update discussion
    scenario: "regulatory_update",
    notes: [
      {
        author: "Camille Leroy",
        content: "🚨 INFO RÉGLEMENTAIRE URGENTE : Nouvelle restriction EU sur le Butylphenyl Methylpropional (BMHCA/Lilial) - Interdiction totale à partir du 1er mars 2025 dans tous les cosmétiques. Impact sur 47 de nos formules !",
        daysAgo: 45,
        attachments: [
          { name: "Règlement_UE_2024_Lilial.pdf", type: "pdf" as const, size: "892 KB" },
          { name: "Liste_Formules_Impactées.xlsx", type: "excel" as const, size: "234 KB" }
        ]
      },
      {
        author: "Laurent Petit",
        content: "Merci Camille. J'ai identifié 3 substituts potentiels : Hexyl Cinnamal, Amyl Cinnamal, et Linalool. Le Hexyl Cinnamal semble le plus proche olfactivement. Quelqu'un a déjà travaillé avec ces alternatives ?",
        daysAgo: 44
      },
      {
        author: "Émilie Garnier",
        content: "Oui, on a testé le Hexyl Cinnamal l'année dernière pour un autre projet. Attention, c'est un allergène du top 26, donc déclaration obligatoire sur étiquette. Aussi, profil toxicologique à vérifier - voir l'étude RIFM en PJ.",
        daysAgo: 44,
        attachments: [
          { name: "Étude_RIFM_Hexyl_Cinnamal.pdf", type: "pdf" as const, size: "1.2 MB" },
          { name: "Évaluation_Toxicologique.pdf", type: "pdf" as const, size: "3.4 MB" }
        ]
      },
      {
        author: "Camille Leroy",
        content: "Réunion d'urgence organisée pour demain 14h avec R&D, Qualité, Réglementaire et Marketing. Ordre du jour : 1) Validation des substituts, 2) Planning reformulation, 3) Communication clients. Convocation envoyée.",
        daysAgo: 43,
        attachments: [
          { name: "ODJ_Réunion_Lilial.docx", type: "word" as const, size: "45 KB" }
        ]
      },
      {
        author: "Laurent Petit",
        content: "Compte-rendu de réunion : décision de partir sur le Hexyl Cinnamal pour 42 formules et reformulation complète pour 5 formules complexes. Timeline aggressive : fin des reformulations pour le 15 janvier 2025. Besoin de ressources supplémentaires en labo.",
        daysAgo: 42,
        attachments: [
          { name: "CR_Réunion_Stratégie_Lilial.pdf", type: "pdf" as const, size: "567 KB" },
          { name: "Planning_Reformulations.xlsx", type: "excel" as const, size: "178 KB" },
          { name: "Budget_Projet_Substitution.xlsx", type: "excel" as const, size: "112 KB" }
        ]
      },
      {
        author: "Émilie Garnier",
        content: "✅ Update : 28/47 formules reformulées et validées. Tests de stabilité en cours. 14 formules en cours de validation olfactive avec le panel. 5 formules en reformulation complète (deadline : 10/01). On tient les délais !",
        daysAgo: 15,
        attachments: [
          { name: "Dashboard_Avancement_Projet.xlsx", type: "excel" as const, size: "245 KB" }
        ]
      }
    ]
  },
  {
    // Sustainability initiative
    scenario: "sustainability",
    notes: [
      {
        author: "Nicolas Fontaine",
        content: "Dans le cadre de notre stratégie RSE 2025, je propose de switcher notre huile de palme conventionnelle vers une source RSPO certifiée. Légère surcoût (+8%) mais impact environnemental très positif. Qu'en pensez-vous ?",
        daysAgo: 60,
        attachments: [
          { name: "Étude_Impact_Huile_Palme.pdf", type: "pdf" as const, size: "2.1 MB" },
          { name: "Analyse_Coûts_RSPO.xlsx", type: "excel" as const, size: "189 KB" }
        ]
      },
      {
        author: "Valérie Moreau",
        content: "Excellente initiative Nicolas ! Le marketing est très demandeur pour valoriser nos engagements durables. Le surcoût de 8% est largement justifiable. Avons-nous identifié des fournisseurs RSPO certifiés avec des capacités suffisantes ?",
        daysAgo: 59
      },
      {
        author: "Nicolas Fontaine",
        content: "Oui, 3 fournisseurs présélectionnés : Sime Darby (Malaisie), IOI Group (Malaisie), et Astra Agro Lestari (Indonésie). Tous certifiés RSPO Mass Balance ou Segregated. Tableau comparatif en pièce jointe avec scores RSE.",
        daysAgo: 58,
        attachments: [
          { name: "Comparatif_Fournisseurs_RSPO.xlsx", type: "excel" as const, size: "312 KB" },
          { name: "Certificats_RSPO_Fournisseurs.pdf", type: "pdf" as const, size: "4.5 MB" },
          { name: "Audit_RSE_Sites_Production.pdf", type: "pdf" as const, size: "6.8 MB" }
        ]
      },
      {
        author: "Pierre Lemoine",
        content: "J'ai fait tourner les calculs : avec nos volumes actuels (240 tonnes/an), le surcoût annuel serait de 152K€. Par contre, ça nous permettrait d'obtenir le label \"Palm Oil Free\" sur certaines gammes et la certification B Corp. ROI positif dès la 2ème année.",
        daysAgo: 57,
        attachments: [
          { name: "Business_Case_RSPO.xlsx", type: "excel" as const, size: "456 KB" },
          { name: "Projection_ROI_3ans.xlsx", type: "excel" as const, size: "234 KB" }
        ]
      },
      {
        author: "Valérie Moreau",
        content: "Le comité de direction a validé ! 🎉 On part avec IOI Group (meilleur score RSE + proximité géographique pour optimiser le transport). Transition progressive sur 6 mois à partir de mars 2025. Super boulot Nicolas !",
        daysAgo: 45,
        attachments: [
          { name: "Décision_COMEX_Huile_Palme.pdf", type: "pdf" as const, size: "234 KB" }
        ]
      },
      {
        author: "Nicolas Fontaine",
        content: "✅ Contrat signé avec IOI Group. Premier container attendu semaine 12. J'ai préparé le plan de communication interne et externe. On vise la certification B Corp pour fin 2025. Merci à tous pour votre soutien sur ce projet !",
        daysAgo: 30,
        attachments: [
          { name: "Contrat_IOI_Group_2025.pdf", type: "pdf" as const, size: "1.9 MB" },
          { name: "Plan_Communication_RSE.pptx", type: "other" as const, size: "8.7 MB" }
        ]
      }
    ]
  },
  {
    // Cost optimization discussion
    scenario: "cost_optimization",
    notes: [
      {
        author: "Julien Roussel",
        content: "Suite à la réunion achats : objectif de réduction de 12% des coûts matières premières pour 2025. J'ai analysé nos 50 MPs les plus consommées - potentiel d'économies sur la vitamine E et le panthénol. Analyse détaillée en PJ.",
        daysAgo: 35,
        attachments: [
          { name: "Analyse_Coûts_MPs_Top50.xlsx", type: "excel" as const, size: "567 KB" },
          { name: "Opportunités_Économies_2025.pdf", type: "pdf" as const, size: "2.3 MB" }
        ]
      },
      {
        author: "Sarah Bonnet",
        content: "Intéressant Julien. Pour la vitamine E, j'ai un contact chez DSM qui propose une qualité équivalente à -18%. Par contre minimum de commande : 500kg. On a la capacité de stockage ?",
        daysAgo: 34
      },
      {
        author: "Julien Roussel",
        content: "500kg c'est OK pour nos entrepôts. Par contre attention à la date de péremption - la vitamine E c'est 24 mois. Il faut vérifier nos cadences de consommation pour éviter les pertes. Sarah, tu peux demander un échantillon pour tests de validation ?",
        daysAgo: 34
      },
      {
        author: "Sarah Bonnet",
        content: "Échantillon reçu et testé. Qualité conforme, stabilité OK. J'ai fait une simulation : avec notre consommation moyenne (45kg/mois), on écoule 500kg en 11 mois - marge confortable. Économie annuelle estimée : 28K€.",
        daysAgo: 28,
        attachments: [
          { name: "Tests_Validation_Vitamine_E.pdf", type: "pdf" as const, size: "1.4 MB" },
          { name: "Simulation_Consommation_VitE.xlsx", type: "excel" as const, size: "123 KB" }
        ]
      },
      {
        author: "Julien Roussel",
        content: "Parfait ! Je lance la procédure de changement de fournisseur. Pour le panthénol, j'attends encore 2 devis mais ça s'annonce bien aussi. On devrait largement atteindre notre objectif de 12%. Meeting de suivi dans 15 jours.",
        daysAgo: 27
      }
    ]
  }
]

// Generate realistic conversation notes for a raw material
function generateConversationNotes(materialName: string, index: number): RegulatoryNote[] {
  // Use different templates based on material index
  const templateIndex = index % conversationTemplates.length
  const template = conversationTemplates[templateIndex]

  const baseDate = new Date()

  return template.notes.map((note, idx) => {
    const noteDate = new Date(baseDate)
    noteDate.setDate(noteDate.getDate() - note.daysAgo)

    const attachments: NoteAttachment[] | undefined = note.attachments?.map((att, attIdx) => ({
      id: `att-${index}-${idx}-${attIdx}`,
      name: att.name,
      type: att.type,
      url: `/mock-files/${att.name.toLowerCase().replace(/\s+/g, '-')}`,
      size: att.size,
      uploadedAt: noteDate.toISOString()
    }))

    return {
      id: `note-${index}-${idx}`,
      content: note.content,
      createdAt: noteDate.toISOString(),
      createdBy: note.author,
      attachments
    }
  })
}

// Generate 100+ Raw Materials
export function generateMockRawMaterials(count: number = 120): RawMaterial[] {
  const materials: RawMaterial[] = []
  const usedCommercialNames = new Set<string>()
  const usedCodes = new Set<string>()

  const gradeOptions = [
    "Pharmaceutical",
    "Cosmétique",
    "Technique",
    "Food Grade",
    "Bio",
    "USP",
  ]

  const originFallbacks = ["France", "Germany", "USA", "Spain", "Italy", "India", "China", "Brazil"]

  const baseMaterials: Array<Partial<RawMaterial> & { id: string }> = [
    {
      id: "rm-001",
      commercialName: "TocoShield 70",
      supplier: "BASF",
      site: "FR-LYO",
      status: "Approuvé",
      inci: "TOCOPHEROL",
      grade: "Pharmaceutical",
      originCountry: "France",
      favorite: true,
      documentsCount: 4,
      certificationsCount: 3,
      ifraCategory: "Cat 3",
      risks: ["IFRA restreint"],
      keywords: ["vitamine e", "antioxydant", "basf"],
    },
    {
      id: "rm-002",
      commercialName: "GeraniPure Select",
      supplier: "Givaudan",
      site: "DE-BER",
      status: "Actif",
      inci: "GERANIOL",
      grade: "Pharmaceutical",
      originCountry: "Germany",
      favorite: false,
      documentsCount: 2,
      certificationsCount: 1,
      ifraCategory: "Cat 5",
      allergens: ["Geraniol"],
      risks: ["Allergène 26"],
    },
  ]

  const createMaterial = (
    index: number,
    overrides: Partial<RawMaterial> & { id?: string } = {}
  ): RawMaterial => {
    const siteRecord =
      overrides.site !== undefined
        ? mockSites.find((site) => site.code === overrides.site) ?? randomItem(mockSites)
        : randomItem(mockSites)

    const supplierName =
      overrides.supplier ?? randomItem(mockCompanies).name

    const inci = overrides.inci ?? randomItem(mockInciNames)

    let commercialName = overrides.commercialName ?? generateCommercialName()
    let attempts = 0
    while (usedCommercialNames.has(commercialName.toLowerCase()) && attempts < 10) {
      commercialName = generateCommercialName()
      attempts++
    }
    usedCommercialNames.add(commercialName.toLowerCase())

    let code = overrides.code ?? generateSiteCode(siteRecord, index + 1)
    let codeAttempts = 0
    while (usedCodes.has(code) && codeAttempts < 5) {
      code = generateSiteCode(siteRecord, index + codeAttempts + 2)
      codeAttempts++
    }
    usedCodes.add(code)

    const status = overrides.status ?? randomStatus()
    const originCountry =
      overrides.originCountry ?? siteRecord.country ?? randomItem(originFallbacks)
    const grade = overrides.grade ?? randomItem(gradeOptions)
    const productionSiteName =
      overrides.productionSiteName ?? siteRecord.name
    const lot =
      overrides.lot ?? `LOT-${siteRecord.code}-${String(index + 101).padStart(3, "0")}`
    const expirationDate =
      overrides.expirationDate ?? (Math.random() > 0.55 ? futureDate(540) : undefined)
    const updatedAt = overrides.updatedAt ?? randomDate(180)
    const documentsCount =
      overrides.documentsCount ?? (Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0)
    const certificationsCount =
      overrides.certificationsCount ?? (Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0)
    const favorite =
      typeof overrides.favorite === "boolean" ? overrides.favorite : Math.random() > 0.82
    const casEcPairs = overrides.casEcPairs ?? generateCasPairs(inci, index)
    const allergens = overrides.allergens ?? randomSubset(allergenPool, 2)
    const ifraCategory =
      overrides.ifraCategory ?? randomItem(ifraCategories)
    const risks = overrides.risks ?? randomSubset(riskBadges, 2)
    const keywords =
      overrides.keywords ??
      [commercialName, inci, supplierName, siteRecord.code, grade, originCountry]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase())
    const lastViewedAt =
      overrides.lastViewedAt ?? (Math.random() > 0.85 ? randomDate(30) : undefined)
    const notes =
      overrides.notes ?? (index < 12 ? generateConversationNotes(commercialName, index) : undefined)

    return {
      id: overrides.id ?? `rm-${index + 1}`,
      commercialName,
      code,
      inci,
      supplier: supplierName,
      site: siteRecord.code,
      status,
      updatedAt,
      documentsCount,
      certificationsCount,
      favorite,
      originCountry,
      grade,
      lot,
      expirationDate,
      productionSiteName,
      casEcPairs,
      allergens,
      ifraCategory,
      risks,
      keywords,
      lastViewedAt,
      documents: overrides.documents,
      notes,
    }
  }

  const baseToUse =
    count >= baseMaterials.length ? baseMaterials : baseMaterials.slice(0, count)

  for (const base of baseToUse) {
    materials.push(createMaterial(materials.length, base))
  }

  while (materials.length < count) {
    materials.push(createMaterial(materials.length))
  }

  return materials.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

// Export generated data
export const mockRawMaterials = generateMockRawMaterials()
