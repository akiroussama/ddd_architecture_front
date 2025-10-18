import { Blacklist, InciEntry, Restriction, Substance } from "@/shared/types"

export const substanceClasses = [
  "Base",
  "Conservateur",
  "Tensioactif",
  "Agent Chélatant",
  "Actif",
  "Colorant",
  "Antioxydant",
  "Humectant",
  "Emollient",
  "Agent Masquant"
]

export const substanceFamilies = [
  "Solvant",
  "Parfum",
  "Tensioactif",
  "Agent Moussant",
  "Conservateur",
  "Agent Chélatant",
  "Actif Vitaminé",
  "Antioxydant",
  "Exfoliant",
  "Hydratant",
  "Agent Apaisant",
  "Beurre Végétal",
  "Humectant",
  "Agent Conditionneur",
  "Agent Éclaircissant",
  "Allergène"
]

export const allergenGroups = [
  "Fragrance Allergens",
  "EU 26 Allergens",
  "Preservative Allergens",
  "None"
]

export const functionsCatalog = [
  "Solvant",
  "Parfum",
  "Conservateur",
  "Agent Moussant",
  "Humectant",
  "Agent Conditionneur",
  "Antioxydant",
  "Actif Anti-âge",
  "Actif Éclaircissant",
  "Apaisant",
  "Exfoliant",
  "Colorant"
]

export const inventoryFunctionsCatalog = [
  "Solvent (CosIng)",
  "Fragrance (CosIng)",
  "Preservative (CosIng)",
  "Surfactant (CosIng)",
  "Humectant (CosIng)",
  "Antioxidant (CosIng)",
  "Skin Conditioning (CosIng)",
  "Emollient (CosIng)",
  "Skin Lightening (CosIng)",
  "Keratolytic (CosIng)",
  "UV Filter (CosIng)"
]

export const mockInciEntries: InciEntry[] = [
  {
    id: "inci-001",
    name: "Aqua / Water",
    annexReference: "Annexe VI — Règlement (CE) 1223/2009",
    usMonograph: "USP Purified Water",
    euInventorySource: "CosIng Inventory",
    usInventorySource: "USP-NF",
    comment:
      "Qualité pharma validée pour les ateliers aseptiques. Production monitorée via système SCADA avec libération QA quotidienne.",
    synonyms: ["Water", "Purified Water", "Eau purifiée"],
    createdAt: "2024-01-05T08:15:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-08-02T11:45:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "inci-002",
    name: "Butylene Glycol",
    annexReference: "Annexe III — Restriction 12f",
    usMonograph: "CTFA Monograph 984",
    euInventorySource: "Reach Annex XVII",
    usInventorySource: "PCPC Dictionary",
    comment:
      "Matière première multi-source. Version RSPO MB prioritaire pour les lancements Clean Beauty et dossiers Chine.",
    synonyms: ["1,3-Butanediol"],
    createdAt: "2023-11-12T09:30:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-06-19T10:05:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "inci-003",
    name: "Glycerin",
    annexReference: "Non listé",
    usMonograph: "USP Glycerin",
    euInventorySource: "CosIng Inventory",
    usInventorySource: "USP-NF",
    comment:
      "Grade végétal traçable (colza européen). Audit fournisseur 2025 conclu sans non-conformités. Stabilité confirmée jusqu'à 45°C.",
    synonyms: ["Glycerol", "Glycérol"],
    createdAt: "2024-04-01T07:50:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-07-27T08:20:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "inci-004",
    name: "Phenoxyethanol",
    annexReference: "Annexe VI — Point 29",
    usMonograph: "FDA VCRP",
    euInventorySource: "SCCS Opinion 2016",
    usInventorySource: "PCPC Dictionary",
    comment:
      "Limiter l'usage à 0.7% sur segment baby care. Fournisseur SynReg validé avec certificat allergènes 2025.",
    synonyms: ["2-Phenoxyethanol"],
    createdAt: "2024-07-22T09:10:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-02-18T09:45:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "inci-005",
    name: "Niacinamide",
    annexReference: "Non listé",
    usMonograph: "USP Niacinamide",
    euInventorySource: "CosIng Inventory",
    usInventorySource: "USP-NF",
    comment:
      "Grade dermo validé. Données cliniques 12 semaines pigmentation disponibles dans dossier R&I 2025_48.",
    synonyms: ["Vitamin B3", "Nicotinamide"],
    createdAt: "2024-05-18T09:10:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-09-05T16:00:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "inci-006",
    name: "Titanium Dioxide",
    annexReference: "Annexe VI — Point 27",
    usMonograph: "FDA Monograph Sunscreen 2019",
    euInventorySource: "Reach Annex XIV",
    usInventorySource: "FDA VCRP",
    comment:
      "Utiliser uniquement grades enrobés sans nanoparticules libres. Dossier photoprotection revu Q2 2025.",
    synonyms: ["CI 77891"],
    createdAt: "2023-08-14T10:00:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-03-21T14:35:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "inci-007",
    name: "Tocopherol",
    annexReference: "Non listé",
    usMonograph: "USP Tocopherol",
    euInventorySource: "CosIng Inventory",
    usInventorySource: "USP-NF",
    comment:
      "Origine tournesol tracée. Obligatoire pour les formules claim 'Natural Vitamin E'. Vérifier indice de peroxyde <2.",
    synonyms: ["Vitamin E"],
    createdAt: "2023-11-22T09:00:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-07-02T10:40:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "inci-008",
    name: "Panthenol",
    annexReference: "Non listé",
    usMonograph: "CTFA Monograph 1072",
    euInventorySource: "IFSCC Monograph 2018",
    usInventorySource: "PCPC Dictionary",
    comment:
      "Version D-Panthenol 75% priorisée. Études d'irritation satisfaisantes. Valider odeur avant lancement baby soothing.",
    synonyms: ["Provitamin B5"],
    createdAt: "2023-06-14T08:00:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-03-03T09:30:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "inci-009",
    name: "Butyrospermum Parkii Butter",
    annexReference: "Non listé",
    usMonograph: "INCI Directory — Shea Butter",
    euInventorySource: "Internal Qualification 2025",
    usInventorySource: "PCPC Dictionary",
    comment:
      "Matière première commerce équitable (coopérative Burkina Faso). Analyse pesticides trimestrielle — lot conforme Q3.",
    synonyms: ["Shea Butter"],
    createdAt: "2024-02-22T09:20:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-02-11T07:25:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "inci-010",
    name: "Caprylyl Glycol",
    annexReference: "Non listé",
    usMonograph: "CTFA Monograph 1256",
    euInventorySource: "CosIng Inventory",
    usInventorySource: "PCPC Dictionary",
    comment:
      "Synergie conservateurs validée à 0.45%. Option booster à associer avec phenoxyethanol pour conserver broad spectrum.",
    synonyms: ["1,2-Octanediol"],
    createdAt: "2024-03-02T07:30:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-01-24T11:20:00Z",
    updatedBy: "Marie Dubois"
  }
]

export const mockSubstances: Substance[] = [
  {
    id: "sub-001",
    inciEU: "Aqua",
    inciUS: "Water",
    inciMixed: "Aqua / Water / Eau",
    casEinecsPairs: [
      {
        id: "pair-001",
        cas: "7732-18-5",
        einecs: "231-791-2",
        source: "Regulatory list",
        createdAt: "2024-12-01T08:30:00Z",
        createdBy: "Marie Dubois"
      }
    ],
    class: "Base",
    families: ["Solvant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Solvant"],
    functionsInventory: ["Solvent (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-001",
        name: "Certificat de qualité - Aqua.pdf",
        fileUrl: "#",
        comment: "Lot Q4 2025",
        createdAt: "2025-09-12T10:00:00Z",
        createdBy: "Marie Dubois",
        updatedAt: "2025-09-12T10:00:00Z",
        updatedBy: "Marie Dubois"
      }
    ],
    notes: [
      {
        id: "note-001",
        content: "Eau purifiée conforme aux exigences pharmaceutiques.",
        createdAt: "2025-09-10T09:00:00Z",
        createdBy: "Marie Dubois"
      }
    ],
    status: "active",
    createdAt: "2024-12-01T08:30:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-09-12T10:00:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "sub-002",
    inciEU: "Parfum",
    inciUS: "Fragrance",
    casEinecsPairs: [
      {
        id: "pair-002",
        cas: "Not Available",
        source: "Supplier documentation",
        createdAt: "2024-12-02T09:00:00Z",
        createdBy: "Jean Martin"
      }
    ],
    technicalName: "Fragrance Compound Floral 12",
    canadianTrivialName: "Fragrance Mix",
    families: ["Parfum"],
    allergenGroup: "Fragrance Allergens",
    allergens26: ["Limonene", "Linalool", "Citral", "Geraniol"],
    functions: ["Parfum"],
    functionsInventory: ["Fragrance (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 100 },
      { country: "US", type: "regulated", maxPercentage: 100 },
      { country: "CN", type: "forbidden", maxPercentage: 0 }
    ],
    blacklists: ["Brand A Natural Line", "Hypoallergenic Range"],
    documents: [
      {
        id: "doc-002",
        name: "FDS Parfum Floral.pdf",
        fileUrl: "#",
        comment: "Version 2.1",
        category: "Critique",
        renewable: true,
        expiresAt: "2025-11-15T00:00:00Z",
        createdAt: "2025-05-03T08:00:00Z",
        createdBy: "Jean Martin",
        updatedAt: "2025-08-18T15:25:00Z",
        updatedBy: "Jean Martin"
      },
      {
        id: "doc-003",
        name: "Déclaration IFRA 51.pdf",
        fileUrl: "#",
        comment: "Compatibilité internationale",
        category: "Réglementaire",
        renewable: true,
        expiresAt: "2026-03-01T00:00:00Z",
        createdAt: "2025-06-10T11:15:00Z",
        createdBy: "Claire Morel",
        updatedAt: "2025-09-02T09:40:00Z",
        updatedBy: "Claire Morel"
      }
    ],
    notes: [
      {
        id: "note-002",
        content: "Surveiller les mises à jour IFRA prévues en 2026.",
        createdAt: "2025-09-20T14:30:00Z",
        createdBy: "Jean Martin"
      },
      {
        id: "note-003",
        content: "Allergènes 26 déclarés dans les formules >0.001%.",
        createdAt: "2025-06-02T07:50:00Z",
        createdBy: "Claire Morel"
      }
    ],
    status: "under-review",
    createdAt: "2024-09-18T10:00:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-09-25T09:00:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "sub-003",
    inciEU: "Sodium Lauryl Sulfate",
    inciUS: "Sodium Lauryl Sulfate",
    casEinecsPairs: [
        {
          id: "pair-003",
          cas: "151-21-3",
          einecs: "205-788-1",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    technicalName: "Sulfate dodecyl sodique",
    class: "Tensioactif",
    families: ["Tensioactif", "Agent Moussant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Agent Moussant", "Tensioactif"],
    functionsInventory: ["Surfactant (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 50 },
      { country: "US", type: "listed" }
    ],
    blacklists: ["Sulfate-Free Products"],
    documents: [
      {
        id: "doc-004",
        name: "Rapport toxicologique SLS.pdf",
        fileUrl: "#",
        comment: "Revue annuelle",
        category: "Technique",
        renewable: false,
        createdAt: "2025-01-18T13:00:00Z",
        createdBy: "Marie Dubois",
        updatedAt: "2025-01-18T13:00:00Z",
        updatedBy: "Marie Dubois"
      }
    ],
    notes: [
      {
        id: "note-004",
        content: "Préférer des alternatives plus douces pour les gammes premium.",
        createdAt: "2025-04-12T09:20:00Z",
        createdBy: "Sophie Leroy"
      }
    ],
    status: "active",
    createdAt: "2023-05-12T09:45:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-07-22T16:10:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "sub-004",
    inciEU: "Glycerin",
    inciUS: "Glycerin",
    casEinecsPairs: [
        {
          id: "pair-004",
          cas: "56-81-5",
          einecs: "200-289-5",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    technicalName: "Glycerol",
    class: "Humectant",
    families: ["Humectant", "Hydratant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Humectant", "Hydratant"],
    functionsInventory: ["Humectant (CosIng)", "Skin Conditioning (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-005",
        name: "Certificat origine végétale - Glycérine.pdf",
        fileUrl: "#",
        comment: "Origine colza",
        createdAt: "2025-03-14T10:30:00Z",
        createdBy: "Claire Morel",
        updatedAt: "2025-03-14T10:30:00Z",
        updatedBy: "Claire Morel"
      }
    ],
    notes: [
      {
        id: "note-005",
        content: "Origine RSPO Mass Balance confirmée.",
        createdAt: "2025-03-15T08:00:00Z",
        createdBy: "Claire Morel"
      }
    ],
    status: "active",
    createdAt: "2024-01-05T08:00:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-03-15T08:00:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "sub-005",
    inciEU: "Phenoxyethanol",
    inciUS: "Phenoxyethanol",
    casEinecsPairs: [
        {
          id: "pair-005",
          cas: "122-99-6",
          einecs: "204-589-7",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    technicalName: "2-Phenoxyethanol",
    class: "Conservateur",
    families: ["Conservateur"],
    allergenGroup: "Preservative Allergens",
    allergens26: [],
    functions: ["Conservateur"],
    functionsInventory: ["Preservative (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 1 },
      { country: "JP", type: "regulated", maxPercentage: 1 }
    ],
    blacklists: ["Clean Beauty Promise"],
    documents: [
      {
        id: "doc-006",
        name: "Avis SCCS - Phenoxyethanol.pdf",
        fileUrl: "#",
        comment: "Référence 2016",
        createdAt: "2024-11-02T12:30:00Z",
        createdBy: "Jean Martin",
        updatedAt: "2025-02-18T09:45:00Z",
        updatedBy: "Jean Martin"
      }
    ],
    notes: [
      {
        id: "note-006",
        content: "Limiter à 0.7% pour la gamme baby care.",
        createdAt: "2025-02-18T10:00:00Z",
        createdBy: "Jean Martin"
      }
    ],
    status: "active",
    createdAt: "2024-07-22T09:10:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-02-18T09:45:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "sub-006",
    inciEU: "Caprylyl Glycol",
    inciUS: "Caprylyl Glycol",
    casEinecsPairs: [
        {
          id: "pair-006",
          cas: "1117-86-8",
          einecs: "214-254-7",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    technicalName: "1,2-Octanediol",
    class: "Agent Conditionneur",
    families: ["Humectant", "Agent Conditionneur"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Humectant", "Conservateur"],
    functionsInventory: ["Humectant (CosIng)", "Skin Conditioning (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-007",
        name: "Spécification technique - Caprylyl Glycol.pdf",
        fileUrl: "#",
        comment: "Pureté 99%",
        createdAt: "2025-01-24T11:20:00Z",
        createdBy: "Marie Dubois",
        updatedAt: "2025-01-24T11:20:00Z",
        updatedBy: "Marie Dubois"
      }
    ],
    notes: [],
    status: "active",
    createdAt: "2024-03-02T07:30:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-01-24T11:20:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "sub-007",
    inciEU: "Benzyl Alcohol",
    inciUS: "Benzyl Alcohol",
    casEinecsPairs: [
        {
          id: "pair-007",
          cas: "100-51-6",
          einecs: "202-859-9",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    technicalName: "Phénylcarbinol",
    class: "Conservateur",
    families: ["Conservateur", "Parfum"],
    allergenGroup: "Fragrance Allergens",
    allergens26: ["Benzyl Alcohol"],
    functions: ["Conservateur", "Parfum"],
    functionsInventory: ["Preservative (CosIng)", "Fragrance (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 1 },
      { country: "US", type: "regulated", maxPercentage: 1 },
      { country: "AU", type: "regulated", maxPercentage: 1 }
    ],
    blacklists: ["Hypoallergenic Range"],
    documents: [
      {
        id: "doc-008",
        name: "SCCS/1459/11 Benzyl Alcohol.pdf",
        fileUrl: "#",
        comment: "Note toxicologique",
        createdAt: "2025-04-01T09:35:00Z",
        createdBy: "Sophie Leroy",
        updatedAt: "2025-06-28T11:05:00Z",
        updatedBy: "Sophie Leroy"
      }
    ],
    notes: [
      {
        id: "note-007",
        content: "Ajouter étiquetage allergène si >0.001% dans leave-on.",
        createdAt: "2025-06-28T11:10:00Z",
        createdBy: "Sophie Leroy"
      }
    ],
    status: "under-review",
    createdAt: "2024-02-10T10:00:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-06-28T11:05:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "sub-008",
    inciEU: "Citric Acid",
    inciUS: "Citric Acid",
    casEinecsPairs: [
        {
          id: "pair-008",
          cas: "77-92-9",
          einecs: "201-069-1",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Agent Chélatant",
    families: ["Agent Chélatant", "Exfoliant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Agent Chélatant", "Exfoliant"],
    functionsInventory: ["Chelating (CosIng)", "pH Regulator (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [],
    notes: [],
    status: "active",
    createdAt: "2023-09-12T08:00:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-04-10T09:00:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "sub-009",
    inciEU: "Niacinamide",
    inciUS: "Niacinamide",
    casEinecsPairs: [
        {
          id: "pair-009",
          cas: "98-92-0",
          einecs: "202-713-4",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Actif",
    families: ["Actif Vitaminé"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Actif", "Agent Éclaircissant"],
    functionsInventory: ["Skin Conditioning (CosIng)", "Skin Lightening (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" },
      { country: "JP", type: "regulated", maxPercentage: 5 }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-009",
        name: "Dossier efficacité Niacinamide.pdf",
        fileUrl: "#",
        comment: "Essais cliniques 2024",
        createdAt: "2024-11-25T07:45:00Z",
        createdBy: "Claire Morel",
        updatedAt: "2025-09-05T16:00:00Z",
        updatedBy: "Claire Morel"
      }
    ],
    notes: [
      {
        id: "note-008",
        content: "Prévoir test de stabilité à pH 4.5.",
        createdAt: "2025-09-05T16:10:00Z",
        createdBy: "Claire Morel"
      }
    ],
    status: "active",
    createdAt: "2024-05-18T09:10:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-09-05T16:00:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "sub-010",
    inciEU: "Tocopherol",
    inciUS: "Tocopherol",
    casEinecsPairs: [
        {
          id: "pair-010",
          cas: "10191-41-0",
          einecs: "233-466-0",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        },
        {
          id: "pair-011",
          cas: "1406-18-4",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Antioxydant",
    families: ["Antioxydant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Antioxydant"],
    functionsInventory: ["Antioxidant (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-010",
        name: "Certificat non OGM - Tocopherol.pdf",
        fileUrl: "#",
        comment: "Origine tournesol",
        createdAt: "2025-07-02T10:40:00Z",
        createdBy: "Sophie Leroy",
        updatedAt: "2025-07-02T10:40:00Z",
        updatedBy: "Sophie Leroy"
      }
    ],
    notes: [],
    status: "active",
    createdAt: "2023-11-22T09:00:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-07-02T10:40:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "sub-011",
    inciEU: "Titanium Dioxide",
    inciUS: "Titanium Dioxide",
    casEinecsPairs: [
        {
          id: "pair-012",
          cas: "13463-67-7",
          einecs: "236-675-5",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Colorant",
    families: ["Colorant", "UV Filter"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Colorant", "UV Filter"],
    functionsInventory: ["Colorant (CosIng)", "UV Filter (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 25 },
      { country: "US", type: "regulated", maxPercentage: 25 },
      { country: "AU", type: "regulated", maxPercentage: 10 }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-011",
        name: "FDS TiO2 grade micronisé.pdf",
        fileUrl: "#",
        comment: "Inclut warning inhalation",
        createdAt: "2025-01-08T08:15:00Z",
        createdBy: "Marie Dubois",
        updatedAt: "2025-05-12T09:25:00Z",
        updatedBy: "Marie Dubois"
      }
    ],
    notes: [
      {
        id: "note-009",
        content: "Interdiction particules <100 nm pour sprays.",
        createdAt: "2025-05-12T09:30:00Z",
        createdBy: "Marie Dubois"
      }
    ],
    status: "active",
    createdAt: "2023-04-15T11:20:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-05-12T09:25:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "sub-012",
    inciEU: "Salicylic Acid",
    inciUS: "Salicylic Acid",
    casEinecsPairs: [
        {
          id: "pair-013",
          cas: "69-72-7",
          einecs: "200-712-3",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Actif",
    families: ["Exfoliant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Exfoliant", "Conservateur"],
    functionsInventory: ["Keratolytic (CosIng)", "Preservative (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 2 },
      { country: "US", type: "regulated", maxPercentage: 2 },
      { country: "CA", type: "regulated", maxPercentage: 2 }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-012",
        name: "Avis SCCS - Salicylic Acid 2023.pdf",
        fileUrl: "#",
        comment: "Limites par catégorie",
        createdAt: "2025-03-18T08:30:00Z",
        createdBy: "Jean Martin",
        updatedAt: "2025-08-01T07:55:00Z",
        updatedBy: "Jean Martin"
      }
    ],
    notes: [
      {
        id: "note-010",
        content: "Attention aux restrictions enfants <3 ans.",
        createdAt: "2025-08-01T08:00:00Z",
        createdBy: "Jean Martin"
      }
    ],
    status: "active",
    createdAt: "2023-12-12T09:30:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-08-01T07:55:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "sub-013",
    inciEU: "Retinol",
    inciUS: "Retinol",
    casEinecsPairs: [
        {
          id: "pair-014",
          cas: "68-26-8",
          einecs: "200-683-7",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Actif",
    families: ["Actif Anti-âge"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Actif", "Anti-âge"],
    functionsInventory: ["Skin Conditioning (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 0.3 },
      { country: "US", type: "listed" },
      { country: "AU", type: "regulated", maxPercentage: 0.3 }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-013",
        name: "Note interne tolérance rétinol.pdf",
        fileUrl: "#",
        comment: "Suivi cosmétiques 2025",
        createdAt: "2025-07-15T13:50:00Z",
        createdBy: "Claire Morel",
        updatedAt: "2025-07-15T13:50:00Z",
        updatedBy: "Claire Morel"
      }
    ],
    notes: [
      {
        id: "note-011",
        content: "Prévoir avertissement femmes enceintes sur pack.",
        createdAt: "2025-07-16T09:00:00Z",
        createdBy: "Claire Morel"
      }
    ],
    status: "under-review",
    createdAt: "2024-10-04T08:00:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-07-16T09:00:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "sub-014",
    inciEU: "Sodium Hyaluronate",
    inciUS: "Sodium Hyaluronate",
    casEinecsPairs: [
        {
          id: "pair-015",
          cas: "9067-32-7",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Humectant",
    families: ["Hydratant", "Humectant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Humectant", "Hydratant"],
    functionsInventory: ["Humectant (CosIng)", "Skin Conditioning (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-014",
        name: "Certificat poids moléculaire HA.pdf",
        fileUrl: "#",
        comment: "1-1.5 MDa",
        createdAt: "2025-08-05T10:10:00Z",
        createdBy: "Marie Dubois",
        updatedAt: "2025-08-05T10:10:00Z",
        updatedBy: "Marie Dubois"
      }
    ],
    notes: [],
    status: "active",
    createdAt: "2024-05-01T09:00:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-08-05T10:10:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "sub-015",
    inciEU: "Panthenol",
    inciUS: "Panthenol",
    casEinecsPairs: [
        {
          id: "pair-016",
          cas: "81-13-0",
          einecs: "201-327-3",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Actif",
    families: ["Agent Apaisant", "Humectant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Apaisant", "Humectant"],
    functionsInventory: ["Skin Conditioning (CosIng)", "Humectant (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-015",
        name: "Dossier clinique panthénol.pdf",
        fileUrl: "#",
        comment: "Irritation réduit 2024",
        createdAt: "2024-09-22T14:45:00Z",
        createdBy: "Sophie Leroy",
        updatedAt: "2025-03-03T09:30:00Z",
        updatedBy: "Sophie Leroy"
      }
    ],
    notes: [
      {
        id: "note-012",
        content: "Intégrer dans la gamme post-procédure dermatologique.",
        createdAt: "2025-03-03T09:35:00Z",
        createdBy: "Sophie Leroy"
      }
    ],
    status: "active",
    createdAt: "2023-06-14T08:00:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-03-03T09:30:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "sub-016",
    inciEU: "Butyrospermum Parkii Butter",
    inciUS: "Shea Butter",
    casEinecsPairs: [
        {
          id: "pair-017",
          cas: "194043-92-0",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Emollient",
    families: ["Beurre Végétal", "Emollient"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Emollient", "Apaisant"],
    functionsInventory: ["Emollient (CosIng)", "Skin Conditioning (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-016",
        name: "Certificat équitable karité.pdf",
        fileUrl: "#",
        comment: "Coopérative Burkina Faso",
        createdAt: "2025-02-11T07:25:00Z",
        createdBy: "Claire Morel",
        updatedAt: "2025-02-11T07:25:00Z",
        updatedBy: "Claire Morel"
      }
    ],
    notes: [],
    status: "active",
    createdAt: "2024-02-22T09:20:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-02-11T07:25:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "sub-017",
    inciEU: "Cocamidopropyl Betaine",
    inciUS: "Cocamidopropyl Betaine",
    casEinecsPairs: [
        {
          id: "pair-018",
          cas: "61789-40-0",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Tensioactif",
    families: ["Tensioactif", "Agent Moussant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Agent Moussant", "Conditionneur"],
    functionsInventory: ["Surfactant (CosIng)", "Skin Conditioning (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: ["Sulfate-Free Products"],
    documents: [
      {
        id: "doc-017",
        name: "Fiche technique CAPB.pdf",
        fileUrl: "#",
        comment: "Grade doux",
        createdAt: "2025-04-04T11:55:00Z",
        createdBy: "Marie Dubois",
        updatedAt: "2025-04-04T11:55:00Z",
        updatedBy: "Marie Dubois"
      }
    ],
    notes: [
      {
        id: "note-013",
        content: "Contrôler résidus d'amide <0.3 ppm.",
        createdAt: "2025-04-04T12:00:00Z",
        createdBy: "Marie Dubois"
      }
    ],
    status: "active",
    createdAt: "2024-06-12T10:10:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-04-04T11:55:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "sub-018",
    inciEU: "Alpha-Arbutin",
    inciUS: "Alpha-Arbutin",
    casEinecsPairs: [
        {
          id: "pair-019",
          cas: "84380-01-8",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Actif",
    families: ["Agent Éclaircissant"],
    allergenGroup: "None",
    allergens26: [],
    functions: ["Actif Éclaircissant"],
    functionsInventory: ["Skin Lightening (CosIng)"],
    restrictions: [
      { country: "EU", type: "regulated", maxPercentage: 2 },
      { country: "CN", type: "regulated", maxPercentage: 2 }
    ],
    blacklists: [],
    documents: [
      {
        id: "doc-018",
        name: "Étude stabilité alpha-arbutine.pdf",
        fileUrl: "#",
        comment: "pH optimum 5-6",
        createdAt: "2025-08-22T08:40:00Z",
        createdBy: "Sophie Leroy",
        updatedAt: "2025-08-22T08:40:00Z",
        updatedBy: "Sophie Leroy"
      }
    ],
    notes: [
      {
        id: "note-014",
        content: "Prévoir monitoring hydroquinone trace.",
        createdAt: "2025-08-22T09:00:00Z",
        createdBy: "Sophie Leroy"
      }
    ],
    status: "active",
    createdAt: "2024-08-05T07:10:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-08-22T08:40:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "sub-019",
    inciEU: "Methylisothiazolinone",
    inciUS: "Methylisothiazolinone",
    casEinecsPairs: [
        {
          id: "pair-020",
          cas: "2682-20-4",
          einecs: "220-239-6",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Conservateur",
    families: ["Conservateur"],
    allergenGroup: "Preservative Allergens",
    allergens26: [],
    functions: ["Conservateur"],
    functionsInventory: ["Preservative (CosIng)"],
    restrictions: [
      { country: "EU", type: "forbidden", maxPercentage: 0 },
      { country: "US", type: "regulated", maxPercentage: 0.0015 }
    ],
    blacklists: ["Clean Beauty Promise"],
    documents: [
      {
        id: "doc-019",
        name: "Interdiction MIT leave-on 2017.pdf",
        fileUrl: "#",
        comment: "Résumé réglementation EU",
        createdAt: "2025-02-01T09:15:00Z",
        createdBy: "Jean Martin",
        updatedAt: "2025-02-01T09:15:00Z",
        updatedBy: "Jean Martin"
      }
    ],
    notes: [
      {
        id: "note-015",
        content: "Uniquement autorisé en rinse-off jusqu'à 0.0015%",
        createdAt: "2025-02-01T09:20:00Z",
        createdBy: "Jean Martin"
      }
    ],
    status: "archived",
    createdAt: "2022-05-12T10:00:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-02-01T09:15:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "sub-020",
    inciEU: "Linalool",
    inciUS: "Linalool",
    casEinecsPairs: [
        {
          id: "pair-021",
          cas: "78-70-6",
          einecs: "201-134-4",
          source: "Regulatory list",
          createdAt: "2024-12-01T08:00:00Z",
          createdBy: "System"
        }
    ],
    class: "Parfum",
    families: ["Parfum", "Allergène"],
    allergenGroup: "Fragrance Allergens",
    allergens26: ["Linalool"],
    functions: ["Parfum"],
    functionsInventory: ["Fragrance (CosIng)"],
    restrictions: [
      { country: "EU", type: "listed" },
      { country: "US", type: "listed" }
    ],
    blacklists: ["Hypoallergenic Range"],
    documents: [
      {
        id: "doc-020",
        name: "Profil allergène Linalool.pdf",
        fileUrl: "#",
        comment: "Oxydation surveillée",
        createdAt: "2025-06-30T10:00:00Z",
        createdBy: "Claire Morel",
        updatedAt: "2025-06-30T10:00:00Z",
        updatedBy: "Claire Morel"
      }
    ],
    notes: [
      {
        id: "note-016",
        content: "Informer marketing des obligations d'étiquetage.",
        createdAt: "2025-06-30T10:05:00Z",
        createdBy: "Claire Morel"
      }
    ],
    status: "active",
    createdAt: "2024-02-12T09:00:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-06-30T10:00:00Z",
    updatedBy: "Claire Morel"
  }
]

export const mockRestrictions: Restriction[] = [
  {
    id: "rest-001",
    substanceId: "sub-002",
    country: "EU",
    type: "regulated",
    maxPercentage: 100,
    applications: ["Leave-on", "Rinse-off"],
    observations: "Déclarer les allergènes 26 > 0.001%",
    internalComment: "Suivre IFRA 52",
    labelingRequirements: "Lister allergènes sur INCI",
    reference: "Règlement (CE) 1223/2009",
    revisionDate: "2024-03-15",
    createdAt: "2024-03-20T10:00:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-09-12T14:30:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "rest-002",
    substanceId: "sub-002",
    country: "US",
    type: "regulated",
    maxPercentage: 100,
    applications: ["Leave-on"],
    observations: "FDA recommande analyse allergènes",
    internalComment: "Utiliser liste CIR",
    labelingRequirements: "Mention Fragrance",
    reference: "FDA Cosmetic Ingredient Review",
    revisionDate: "2024-05-01",
    createdAt: "2024-05-05T09:00:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-04-22T07:15:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "rest-003",
    substanceId: "sub-002",
    country: "CN",
    type: "forbidden",
    maxPercentage: 0,
    applications: ["Leave-on"],
    observations: "Usage interdit en parfumerie skin care",
    internalComment: "Vérifier alternatives locales",
    labelingRequirements: "",
    reference: "CSAR Annexe IX",
    revisionDate: "2024-07-18",
    createdAt: "2024-07-20T11:45:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-02-10T08:30:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "rest-004",
    substanceId: "sub-003",
    country: "EU",
    type: "regulated",
    maxPercentage: 50,
    applications: ["Rinse-off"],
    observations: "Limiter dans produits enfants",
    internalComment: "Prévoir alternative sans sulfate",
    labelingRequirements: "",
    reference: "CosIng Entry 688",
    revisionDate: "2023-11-01",
    createdAt: "2023-11-15T08:00:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-06-01T12:00:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "rest-005",
    substanceId: "sub-003",
    country: "US",
    type: "listed",
    applications: ["Rinse-off"],
    observations: "Usage courant shampoings",
    internalComment: "",
    labelingRequirements: "",
    reference: "CIR Review 2010",
    revisionDate: "2023-01-01",
    createdAt: "2023-01-12T09:00:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2024-09-03T15:45:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "rest-006",
    substanceId: "sub-005",
    country: "EU",
    type: "regulated",
    maxPercentage: 1,
    applications: ["Leave-on", "Rinse-off"],
    observations: "Restriction SCCS/1575/16",
    internalComment: "Limiter à 0.7% pour bébé",
    labelingRequirements: "",
    reference: "Annexe V/29",
    revisionDate: "2024-02-21",
    createdAt: "2024-02-25T09:40:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-02-18T09:45:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "rest-007",
    substanceId: "sub-005",
    country: "JP",
    type: "regulated",
    maxPercentage: 1,
    applications: ["Leave-on"],
    observations: "Conformité FSO Japon",
    internalComment: "",
    labelingRequirements: "",
    reference: "Standards JP 2023",
    revisionDate: "2024-06-10",
    createdAt: "2024-06-12T11:10:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2024-12-04T10:00:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "rest-008",
    substanceId: "sub-007",
    country: "EU",
    type: "regulated",
    maxPercentage: 1,
    applications: ["Leave-on"],
    observations: "Allergène à déclarer",
    internalComment: "Suivre limites co-formulants",
    labelingRequirements: "Nom INCI + mention allergène",
    reference: "Annexe III/98",
    revisionDate: "2024-01-15",
    createdAt: "2024-01-20T08:20:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-06-28T11:05:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "rest-009",
    substanceId: "sub-007",
    country: "US",
    type: "regulated",
    maxPercentage: 1,
    applications: ["Leave-on"],
    observations: "Limiter pour produits baby",
    internalComment: "",
    labelingRequirements: "Mention fragrance allergen",
    reference: "CIR Benzyl Alcohol",
    revisionDate: "2024-05-12",
    createdAt: "2024-05-18T07:00:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2024-11-02T09:30:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "rest-010",
    substanceId: "sub-010",
    country: "EU",
    type: "listed",
    applications: ["Leave-on", "Rinse-off"],
    observations: "Aucune restriction spécifique",
    internalComment: "Prévoir certificat non OGM",
    labelingRequirements: "",
    reference: "CosIng Entry 77872",
    revisionDate: "2023-05-01",
    createdAt: "2023-05-10T10:15:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-07-02T10:40:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "rest-011",
    substanceId: "sub-011",
    country: "EU",
    type: "regulated",
    maxPercentage: 25,
    applications: ["Crèmes solaires", "Poudres compactes"],
    observations: "Interdit en spray poudre",
    internalComment: "Vérifier taille particules",
    labelingRequirements: "Mention [nano] si applicable",
    reference: "Annexe VI/27",
    revisionDate: "2024-09-01",
    createdAt: "2024-09-05T13:15:00Z",
    createdBy: "Marie Dubois",
    updatedAt: "2025-05-12T09:25:00Z",
    updatedBy: "Marie Dubois"
  },
  {
    id: "rest-012",
    substanceId: "sub-012",
    country: "EU",
    type: "regulated",
    maxPercentage: 2,
    applications: ["Leave-on", "Rinse-off"],
    observations: "Interdit dans produits enfants <3 ans",
    internalComment: "Limiter à 1% pour leave-on",
    labelingRequirements: `Mention "Contient de l'acide salicylique"`,
    reference: "Annexe III/98",
    revisionDate: "2024-08-01",
    createdAt: "2024-08-05T09:40:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-08-01T07:55:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "rest-013",
    substanceId: "sub-013",
    country: "EU",
    type: "regulated",
    maxPercentage: 0.3,
    applications: ["Crèmes visage", "Sérums"],
    observations: "Ne pas utiliser dans produits corps leave-on",
    internalComment: "Sensibilité photo",
    labelingRequirements: "Conseils d'utilisation nocturne",
    reference: "Annexe III - Entrée 357",
    revisionDate: "2024-11-22",
    createdAt: "2024-11-25T07:30:00Z",
    createdBy: "Claire Morel",
    updatedAt: "2025-07-16T09:00:00Z",
    updatedBy: "Claire Morel"
  },
  {
    id: "rest-014",
    substanceId: "sub-018",
    country: "EU",
    type: "regulated",
    maxPercentage: 2,
    applications: ["Leave-on"],
    observations: "Limiter à 0.5% dans produits corps",
    internalComment: "Surveiller hydroquinone",
    labelingRequirements: "",
    reference: "SCCS/1550/15",
    revisionDate: "2024-10-15",
    createdAt: "2024-10-18T10:40:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2025-08-22T08:40:00Z",
    updatedBy: "Sophie Leroy"
  },
  {
    id: "rest-015",
    substanceId: "sub-019",
    country: "EU",
    type: "forbidden",
    maxPercentage: 0,
    applications: ["Leave-on", "Rinse-off"],
    observations: "Interdite depuis 2017",
    internalComment: "Retirer formulations historiques",
    labelingRequirements: "",
    reference: "Annexe II/1014",
    revisionDate: "2024-02-01",
    createdAt: "2024-02-05T11:20:00Z",
    createdBy: "Jean Martin",
    updatedAt: "2025-02-01T09:15:00Z",
    updatedBy: "Jean Martin"
  },
  {
    id: "rest-016",
    substanceId: "sub-007",
    country: "AU",
    type: "regulated",
    maxPercentage: 1,
    applications: ["Leave-on"],
    observations: "Suivre NICNAS guidance",
    internalComment: "",
    labelingRequirements: "",
    reference: "NICNAS ID 104",
    revisionDate: "2024-03-11",
    createdAt: "2024-03-15T09:20:00Z",
    createdBy: "Sophie Leroy",
    updatedAt: "2024-11-02T09:30:00Z",
    updatedBy: "Sophie Leroy"
  }
]

export const mockBlacklists: Blacklist[] = [
  {
    id: "bl-001",
    name: "Brand A Natural Line",
    brand: "Brand A",
    substancesCount: 3,
    substances: [
      {
        substanceId: "sub-002",
        inciEU: "Parfum",
        maxPercentage: 0,
        comment: "Fragrances interdites",
        createdAt: "2025-09-10T10:00:00Z",
        createdBy: "Audrey Lucas",
        updatedAt: "2025-09-10T10:00:00Z",
        updatedBy: "Audrey Lucas"
      },
      {
        substanceId: "sub-003",
        inciEU: "Sodium Lauryl Sulfate",
        maxPercentage: 0,
        comment: "Interdit pour revendication naturel",
        createdAt: "2025-09-10T10:05:00Z",
        createdBy: "Audrey Lucas",
        updatedAt: "2025-09-10T10:05:00Z",
        updatedBy: "Audrey Lucas"
      },
      {
        substanceId: "sub-019",
        inciEU: "Methylisothiazolinone",
        maxPercentage: 0,
        comment: "Conservateur controversé",
        createdAt: "2025-09-10T10:07:00Z",
        createdBy: "Audrey Lucas",
        updatedAt: "2025-09-10T10:07:00Z",
        updatedBy: "Audrey Lucas"
      }
    ],
    documents: [
      {
        id: "bldoc-001",
        name: "Charte Brand A Natural Line.pdf",
        version: "1.2",
        versionComment: "Ajout restrictions conservateurs",
        uploadDate: "2025-09-10T09:55:00Z",
        uploadedBy: "Audrey Lucas",
        fileUrl: "#"
      }
    ],
    createdAt: "2024-07-12T09:00:00Z",
    createdBy: "Audrey Lucas",
    updatedAt: "2025-09-10T10:07:00Z",
    updatedBy: "Audrey Lucas"
  },
  {
    id: "bl-002",
    name: "Sulfate-Free Products",
    brand: "Global Portfolio",
    substancesCount: 2,
    substances: [
      {
        substanceId: "sub-003",
        inciEU: "Sodium Lauryl Sulfate",
        maxPercentage: 0,
        comment: "Interdit pour claim sulfate-free",
        createdAt: "2024-05-05T08:30:00Z",
        createdBy: "Paul Meunier",
        updatedAt: "2024-05-05T08:30:00Z",
        updatedBy: "Paul Meunier"
      },
      {
        substanceId: "sub-017",
        inciEU: "Cocamidopropyl Betaine",
        maxPercentage: 2,
        minPercentage: 0,
        comment: "Toléré jusqu'à 2%",
        createdAt: "2024-05-05T08:45:00Z",
        createdBy: "Paul Meunier",
        updatedAt: "2025-04-04T12:10:00Z",
        updatedBy: "Paul Meunier"
      }
    ],
    documents: [
      {
        id: "bldoc-002",
        name: "Politique sulfate-free v3.pdf",
        version: "3.0",
        versionComment: "Ajout tensioactifs secondaires",
        uploadDate: "2025-04-04T12:15:00Z",
        uploadedBy: "Paul Meunier",
        fileUrl: "#"
      }
    ],
    createdAt: "2023-09-02T09:20:00Z",
    createdBy: "Paul Meunier",
    updatedAt: "2025-04-04T12:10:00Z",
    updatedBy: "Paul Meunier"
  },
  {
    id: "bl-003",
    name: "Hypoallergenic Range",
    brand: "Kids & Care",
    substancesCount: 3,
    substances: [
      {
        substanceId: "sub-002",
        inciEU: "Parfum",
        maxPercentage: 0,
        comment: "Sans parfum annoncé",
        createdAt: "2025-01-12T11:00:00Z",
        createdBy: "Nadia Cohen",
        updatedAt: "2025-09-25T09:10:00Z",
        updatedBy: "Nadia Cohen"
      },
      {
        substanceId: "sub-007",
        inciEU: "Benzyl Alcohol",
        maxPercentage: 0.1,
        minPercentage: 0,
        comment: "Tolérance traces",
        createdAt: "2025-01-12T11:05:00Z",
        createdBy: "Nadia Cohen",
        updatedAt: "2025-06-28T11:10:00Z",
        updatedBy: "Nadia Cohen"
      },
      {
        substanceId: "sub-020",
        inciEU: "Linalool",
        maxPercentage: 0,
        comment: "Allergène déclaré",
        createdAt: "2025-01-12T11:08:00Z",
        createdBy: "Nadia Cohen",
        updatedAt: "2025-06-30T10:05:00Z",
        updatedBy: "Nadia Cohen"
      }
    ],
    documents: [
      {
        id: "bldoc-003",
        name: "Guide hypoallergenic range.pdf",
        version: "2.4",
        versionComment: "Mise à jour allergènes",
        uploadDate: "2025-06-30T10:10:00Z",
        uploadedBy: "Nadia Cohen",
        fileUrl: "#"
      }
    ],
    createdAt: "2024-02-14T10:00:00Z",
    createdBy: "Nadia Cohen",
    updatedAt: "2025-09-25T09:10:00Z",
    updatedBy: "Nadia Cohen"
  },
  {
    id: "bl-004",
    name: "Clean Beauty Promise",
    brand: "Global Portfolio",
    substancesCount: 2,
    substances: [
      {
        substanceId: "sub-005",
        inciEU: "Phenoxyethanol",
        maxPercentage: 0.5,
        minPercentage: 0,
        comment: "Limiter pour respecter charte",
        createdAt: "2025-05-20T08:15:00Z",
        createdBy: "Paul Meunier",
        updatedAt: "2025-05-20T08:15:00Z",
        updatedBy: "Paul Meunier"
      },
      {
        substanceId: "sub-019",
        inciEU: "Methylisothiazolinone",
        maxPercentage: 0,
        comment: "Interdit",
        createdAt: "2025-05-20T08:18:00Z",
        createdBy: "Paul Meunier",
        updatedAt: "2025-05-20T08:18:00Z",
        updatedBy: "Paul Meunier"
      }
    ],
    documents: [
      {
        id: "bldoc-004",
        name: "Clean Beauty Promise - critères.pdf",
        version: "1.5",
        versionComment: "Ajout conservateurs",
        uploadDate: "2025-05-20T08:12:00Z",
        uploadedBy: "Paul Meunier",
        fileUrl: "#"
      }
    ],
    createdAt: "2024-05-20T08:00:00Z",
    createdBy: "Paul Meunier",
    updatedAt: "2025-05-20T08:18:00Z",
    updatedBy: "Paul Meunier"
  }
]

export function getSubstanceById(id: string) {
  return mockSubstances.find((substance) => substance.id === id) ?? null
}

export function getRestrictionsBySubstanceId(id: string) {
  return mockRestrictions.filter((restriction) => restriction.substanceId === id)
}

export function getBlacklistsBySubstanceId(id: string) {
  return mockBlacklists.filter((blacklist) =>
    blacklist.substances.some((item) => item.substanceId === id)
  )
}

export function getSimilarSubstances(target: Substance, limit = 4) {
  const scored = mockSubstances
    .filter((candidate) => candidate.id !== target.id)
    .map((candidate) => {
      let score = 0
      if (candidate.class && target.class && candidate.class === target.class) {
        score += 3
      }
      const sharedFamilies = candidate.families.filter((family) =>
        target.families.includes(family)
      ).length
      const sharedFunctions = candidate.functions.filter((fn) =>
        target.functions.includes(fn)
      ).length
      score += sharedFamilies * 2 + sharedFunctions * 2
      if (candidate.allergenGroup && candidate.allergenGroup === target.allergenGroup) {
        score += 1
      }
      return { candidate, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ candidate }) => candidate)
}

// ---- Cascade impact mock data ----

interface RawMaterial {
  id: string
  name: string
  code: string
  supplier: string
  status: string
  composition: Array<{
    substanceId: string
    percentage: number
  }>
}

interface Formula {
  id: string
  name: string
  code: string
  marketPresence: string[]
  productType: string
  status: string
  materials: Array<{
    rawMaterialId: string
    dosage: number
  }>
}

interface FinishedProduct {
  id: string
  name: string
  sku: string
  brand: string
  formulaId: string
  businessValue: number
  markets: string[]
}

const mockRawMaterials: RawMaterial[] = [
  {
    id: "rm-001",
    name: "Tensioactif Base",
    code: "MP-2341",
    supplier: "Fournisseur X",
    status: "Approuvée",
    composition: [
      { substanceId: "sub-002", percentage: 12 },
      { substanceId: "sub-003", percentage: 18 }
    ]
  },
  {
    id: "rm-002",
    name: "Base Moussante",
    code: "MP-2342",
    supplier: "Fournisseur Y",
    status: "Approuvée",
    composition: [
      { substanceId: "sub-002", percentage: 8 },
      { substanceId: "sub-004", percentage: 22 }
    ]
  },
  {
    id: "rm-003",
    name: "Parfum Floral Intense",
    code: "MP-5621",
    supplier: "Fournisseur Arômes",
    status: "Sous monitoring",
    composition: [
      { substanceId: "sub-002", percentage: 35 }
    ]
  }
]

const mockFormulas: Formula[] = [
  {
    id: "form-001",
    name: "Shampoing Doux",
    code: "F-8923",
    marketPresence: ["EU", "US", "CN"],
    productType: "Haircare",
    status: "Validée",
    materials: [
      { rawMaterialId: "rm-001", dosage: 15 },
      { rawMaterialId: "rm-003", dosage: 2 }
    ]
  },
  {
    id: "form-002",
    name: "Gel Douche Sport",
    code: "F-8924",
    marketPresence: ["EU"],
    productType: "Bodycare",
    status: "À surveiller",
    materials: [
      { rawMaterialId: "rm-002", dosage: 20 },
      { rawMaterialId: "rm-003", dosage: 1.5 }
    ]
  },
  {
    id: "form-003",
    name: "Crème Mains Apaisante",
    code: "F-9105",
    marketPresence: ["EU", "US"],
    productType: "Skincare",
    status: "Validée",
    materials: [
      { rawMaterialId: "rm-001", dosage: 5 },
      { rawMaterialId: "rm-002", dosage: 4 }
    ]
  }
]

const mockFinishedProducts: FinishedProduct[] = [
  {
    id: "prod-001",
    name: "Kids Shampoo",
    sku: "SKU-1001",
    brand: "Kids Care",
    formulaId: "form-001",
    businessValue: 850000,
    markets: ["EU", "US", "CN"]
  },
  {
    id: "prod-002",
    name: "Sport Shower",
    sku: "SKU-1002",
    brand: "Athletica",
    formulaId: "form-002",
    businessValue: 460000,
    markets: ["EU"]
  },
  {
    id: "prod-003",
    name: "Hand Comfort",
    sku: "SKU-1003",
    brand: "Daily Essentials",
    formulaId: "form-003",
    businessValue: 990000,
    markets: ["EU", "US"]
  }
]

const complianceRulesBySubstance: Record<string, ComplianceRule[]> = {
  "sub-002": [
    {
      region: "EU",
      productType: "Leave-on",
      bodyZone: "Visage",
      maxPercentage: 3,
      status: "allowed"
    },
    {
      region: "EU",
      productType: "Leave-on",
      bodyZone: "Corps",
      maxPercentage: 5,
      status: "allowed"
    },
    {
      region: "EU",
      productType: "Rinse-off",
      bodyZone: "Corps",
      maxPercentage: 10,
      status: "allowed"
    },
    {
      region: "US",
      productType: "Leave-on",
      bodyZone: "Visage",
      maxPercentage: 0,
      status: "forbidden",
      note: "Usage interdit sur le visage en leave-on"
    },
    {
      region: "US",
      productType: "Leave-on",
      bodyZone: "Corps",
      maxPercentage: 2,
      status: "allowed"
    },
    {
      region: "US",
      productType: "Rinse-off",
      bodyZone: "Corps",
      maxPercentage: 8,
      status: "allowed"
    },
    {
      region: "China",
      productType: "Leave-on",
      bodyZone: "Visage",
      maxPercentage: 2.5,
      status: "warning",
      note: "Étiquetage allergènes requis"
    },
    {
      region: "China",
      productType: "Leave-on",
      bodyZone: "Corps",
      maxPercentage: 3,
      status: "warning",
      note: "Mention spéciale parfum obligatoire"
    },
    {
      region: "China",
      productType: "Rinse-off",
      bodyZone: "Corps",
      maxPercentage: 6,
      status: "allowed"
    },
    {
      region: "Japan",
      productType: "Leave-on",
      bodyZone: "Visage",
      maxPercentage: 5,
      status: "allowed"
    },
    {
      region: "Japan",
      productType: "Leave-on",
      bodyZone: "Corps",
      maxPercentage: 6,
      status: "allowed"
    }
  ]
}

const regulatoryTimelineEvents: RegulatoryTimelineEvent[] = [
  {
    id: "evt-001",
    substanceId: "sub-002",
    date: "2025-10-15",
    country: "China",
    type: "restriction",
    title: "Interdit dans produits enfants",
    description:
      "L'utilisation est désormais interdite dans les produits destinés aux enfants (leave-on).",
    impact: {
      formulas: 12,
      businessValue: 1200000
    }
  },
  {
    id: "evt-002",
    substanceId: "sub-002",
    date: "2025-09-02",
    country: "EU",
    type: "warning",
    title: "Limite leave-on réduite",
    description: "La limite max passe de 3% à 1% sur les produits leave-on visage.",
    impact: {
      formulas: 23,
      businessValue: 2300000
    }
  },
  {
    id: "evt-003",
    substanceId: "sub-002",
    date: "2025-07-01",
    country: "US",
    type: "approval",
    title: "Approuvé usage oral",
    description: "L'ingrédient est désormais autorisé en usage oral jusqu'à 0.5%.",
    impact: {
      formulas: 5,
      businessValue: 900000
    },
    links: ["https://fda.gov"]
  },
  {
    id: "evt-004",
    substanceId: "sub-002",
    date: "2025-04-12",
    country: "Japan",
    type: "warning",
    title: "Étiquetage allergènes renforcé",
    description: "Obligation d'indiquer la présence de l'ingrédient sur les produits haircare.",
    impact: {
      formulas: 9
    }
  },
  {
    id: "evt-005",
    substanceId: "sub-002",
    date: "2024-11-03",
    country: "EU",
    type: "restriction",
    title: "Notification SCCS",
    description: "Révision des annexes SCCS : suivi renforcé sur les parfums allergènes.",
    links: ["https://ec.europa.eu"]
  },
  {
    id: "evt-006",
    substanceId: "sub-002",
    date: "2024-07-01",
    country: "China",
    type: "approval",
    title: "Enregistrement CSAR validé",
    description: "L'enregistrement CSAR est validé pour le marché premium.",
    impact: {
      formulas: 3,
      businessValue: 600000
    }
  }
]

const globalComplianceRegistry: Record<string, GlobalComplianceEntry[]> = {
  "sub-001": [
    {
      region: "EU",
      status: "compliant",
      source: "CosIng",
      reference: "Annexe III – liste positive",
      limit: "Sans limite spécifique",
      warning: "Aucune mention particulière requise",
      action: "Rien à faire",
      updatedAt: "2025-08-12T09:00:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Aqua" },
        { type: "CAS", value: "7732-18-5" }
      ]
    },
    {
      region: "US",
      status: "compliant",
      source: "MOCRA",
      reference: "21 CFR 700.3",
      limit: "GRAS / USP grade",
      warning: "Utiliser eau purifiée",
      action: "Conserver traçabilité lot",
      updatedAt: "2025-07-04T10:15:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Water" },
        { type: "CAS", value: "7732-18-5" }
      ]
    },
    {
      region: "UK",
      status: "compliant",
      source: "UK CPR",
      reference: "Schedule 34",
      limit: "Sans limite",
      warning: "Respecter normes microbiologiques",
      action: "Contrôle qualité eau purifiée",
      updatedAt: "2025-06-20T14:30:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Aqua" },
        { type: "CAS", value: "7732-18-5" }
      ]
    },
    {
      region: "CN",
      status: "compliant",
      source: "IECIC 2021",
      reference: "Listé – Fonction solvant",
      limit: "Sans limite",
      warning: "Utiliser eau déminéralisée",
      action: "Assurer conformité CSAR",
      updatedAt: "2025-05-11T08:00:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Aqua" },
        { type: "CAS", value: "7732-18-5" }
      ]
    },
    {
      region: "ASEAN",
      status: "compliant",
      source: "ASEAN Cosmetic Directive",
      reference: "Annexe I",
      limit: "Autorisé toutes catégories",
      warning: "Aucun avertissement requis",
      action: "Maintenir documentation QC",
      updatedAt: "2025-05-01T07:30:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Aqua" },
        { type: "CAS", value: "7732-18-5" }
      ]
    }
  ],
  "sub-002": [
    {
      region: "EU",
      status: "restricted",
      source: "Règlement UE 1223/2009",
      reference: "Annexe III, entrée 45 – IFRA 51",
      limit: "Max 1% leave-on visage",
      warning: "Déclaration allergènes requise",
      action: "Adapter dosage & étiquetage",
      updatedAt: "2025-09-02T09:00:00Z",
      matchedIdentifiers: [{ type: "INCI", value: "Parfum" }]
    },
    {
      region: "US",
      status: "restricted",
      source: "MOCRA / FDA Fragrance Guidance 2025",
      reference: "Section 607 – déclaration allergènes",
      limit: "Max 2% leave-on",
      warning: "Déclarer allergènes listés",
      action: "Mettre à jour Safety Substantiation",
      updatedAt: "2025-08-18T15:30:00Z",
      matchedIdentifiers: [{ type: "INCI", value: "Fragrance" }]
    },
    {
      region: "UK",
      status: "restricted",
      source: "UK CPR",
      reference: "Schedule 34 – aligné IFRA 51",
      limit: "Max 1% leave-on",
      warning: "Étiquetage allergènes obligatoire",
      action: "Mettre à jour fiches UKCA",
      updatedAt: "2025-07-30T11:20:00Z",
      matchedIdentifiers: [{ type: "INCI", value: "Parfum" }]
    },
    {
      region: "CN",
      status: "non-compliant",
      source: "IECIC 2021",
      reference: "Non listé – CSAR 2024",
      limit: "Usage non autorisé",
      warning: "Interdit par CSAR (Catégorie parfum)",
      action: "Écarter du scope Chine ou substituer",
      updatedAt: "2025-10-01T08:30:00Z",
      matchedIdentifiers: [{ type: "INCI", value: "Parfum" }]
    },
    {
      region: "ASEAN",
      status: "restricted",
      source: "ASEAN Cosmetic Directive",
      reference: "Annexe III, entrée 88",
      limit: "Max 2% leave-on",
      warning: "Informer autorités si >0.5% dans parfums",
      action: "Préparer dossier harmonisé ASEAN",
      updatedAt: "2025-08-21T07:50:00Z",
      matchedIdentifiers: [{ type: "INCI", value: "Parfum" }]
    }
  ],
  "sub-003": [
    {
      region: "EU",
      status: "restricted",
      source: "Annexe III – Règlement UE 1223/2009",
      reference: "Entrée 12 – Sodium Lauryl Sulfate",
      limit: "Max 1% leave-on • 10% rinse-off",
      warning: "Étiquetage irritant requis >1%",
      action: "Limiter à 10% et ajouter mention avertissement",
      updatedAt: "2025-05-03T06:45:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Sodium Lauryl Sulfate" },
        { type: "CAS", value: "151-21-3" },
        { type: "EC", value: "205-788-1" }
      ]
    },
    {
      region: "US",
      status: "compliant",
      source: "MOCRA Safety Substantiation",
      reference: "CFR Title 21 – Inert ingredients",
      limit: "Bonnes pratiques de fabrication",
      warning: "Surveiller irritations cutanées",
      action: "Maintenir dossier tox & IFRA",
      updatedAt: "2025-06-18T10:10:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Sodium Lauryl Sulfate" },
        { type: "CAS", value: "151-21-3" }
      ]
    },
    {
      region: "UK",
      status: "restricted",
      source: "UK CPR 2025",
      reference: "Schedule 34 – Annex III aligned",
      limit: "Max 1% leave-on",
      warning: "Mention irritant / rincer abondamment",
      action: "Aligner packaging UKCA",
      updatedAt: "2025-05-15T09:30:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Sodium Lauryl Sulfate" },
        { type: "EC", value: "205-788-1" }
      ]
    },
    {
      region: "CN",
      status: "restricted",
      source: "IECIC 2021",
      reference: "Listé – Surfactant",
      limit: "Max 0.5% leave-on • 5% rinse-off",
      warning: "Déclaration obligatoire si >1%",
      action: "Réduire dosage et soumettre dossier CSAR",
      updatedAt: "2025-07-09T08:20:00Z",
      matchedIdentifiers: [
        { type: "INCI", value: "Sodium Lauryl Sulfate" },
        { type: "CAS", value: "151-21-3" }
      ]
    },
    {
      region: "ASEAN",
      status: "restricted",
      source: "ASEAN Cosmetic Directive",
      reference: "Annexe III – Agents tensioactifs",
      limit: "Max 2% leave-on • 7% rinse-off",
      warning: "Avertissement irritation possible",
      action: "Adapter conformité ACD + notifier",
      updatedAt: "2025-04-17T11:15:00Z",
      matchedIdentifiers: [{ type: "INCI", value: "Sodium Lauryl Sulfate" }]
    }
  ]
}

function buildFallbackComplianceEntries(
  identifiers: GlobalComplianceEntry["matchedIdentifiers"]
): GlobalComplianceEntry[] {
  const regions: GlobalComplianceEntry["region"][] = ["EU", "US", "UK", "CN", "ASEAN"]
  return regions.map((region) => ({
    region,
    status: "investigate",
    source: "Cartographie en cours",
    reference: "Source réglementaire non reliée",
    warning: "Aucune donnée disponible – lancer due diligence",
    action: "Attribuer un analyste conformité",
    updatedAt: new Date().toISOString(),
    matchedIdentifiers: identifiers
  }))
}

const alternativeOptions: AlternativeOption[] = [
  {
    id: "alt-001",
    substanceId: "sub-002",
    inciName: "Phenoxyethanol",
    currentlyUsed: true,
    formulasCount: 126,
    markets: ["EU", "US", "JP"],
    costComparison: "≈",
    pros: ["Déjà référencé", "Compatible multisite"],
    cons: [],
    compatibility: {
      overall: 88,
      breakdown: {
        regulatory: 95,
        technical: 82,
        economic: 85,
        formulation: 90
      }
    },
    radar: [
      { criteria: "Coût", current: 70, alternative: 72 },
      { criteria: "Efficacité", current: 60, alternative: 85 },
      { criteria: "Stabilité", current: 68, alternative: 88 },
      { criteria: "Conformité EU", current: 50, alternative: 95 },
      { criteria: "Conformité US", current: 55, alternative: 90 },
      { criteria: "Naturalité", current: 32, alternative: 60 }
    ],
    impact: {
      compatible: [
        { id: "F-8923", name: "Shampoing Doux", type: "Haircare" },
        { id: "F-8924", name: "Gel Douche Sport", type: "Bodycare" }
      ],
      minor: [
        { id: "F-9105", name: "Crème Mains Apaisante", currentPH: 5.5, targetPH: 5.0 }
      ],
      major: []
    }
  },
  {
    id: "alt-002",
    substanceId: "sub-002",
    inciName: "Sodium Benzoate",
    currentlyUsed: true,
    formulasCount: 89,
    markets: ["EU", "US"],
    costComparison: "<",
    pros: ["Coût inférieur", "Disponibilité large"],
    cons: ["Dépend du pH"],
    compatibility: {
      overall: 78,
      breakdown: {
        regulatory: 88,
        technical: 70,
        economic: 90,
        formulation: 65
      }
    },
    radar: [
      { criteria: "Coût", current: 70, alternative: 85 },
      { criteria: "Efficacité", current: 60, alternative: 70 },
      { criteria: "Stabilité", current: 68, alternative: 75 },
      { criteria: "Conformité EU", current: 50, alternative: 80 },
      { criteria: "Conformité US", current: 55, alternative: 78 },
      { criteria: "Naturalité", current: 32, alternative: 55 }
    ],
    impact: {
      compatible: [
        { id: "F-8923", name: "Shampoing Doux", type: "Haircare" }
      ],
      minor: [
        { id: "F-8924", name: "Gel Douche Sport", currentPH: 6.5, targetPH: 6.0 }
      ],
      major: [
        { id: "F-9105", name: "Crème Mains Apaisante", note: "Revoir conservateur secondary" }
      ]
    }
  },
  {
    id: "alt-003",
    substanceId: "sub-002",
    inciName: "Potassium Sorbate",
    currentlyUsed: true,
    formulasCount: 54,
    markets: ["EU", "US", "LATAM"],
    costComparison: "<",
    pros: ["Facilement substituable"],
    cons: ["Stabilité limitée"],
    compatibility: {
      overall: 72,
      breakdown: {
        regulatory: 80,
        technical: 65,
        economic: 88,
        formulation: 60
      }
    },
    radar: [
      { criteria: "Coût", current: 70, alternative: 88 },
      { criteria: "Efficacité", current: 60, alternative: 65 },
      { criteria: "Stabilité", current: 68, alternative: 70 },
      { criteria: "Conformité EU", current: 50, alternative: 75 },
      { criteria: "Conformité US", current: 55, alternative: 72 },
      { criteria: "Naturalité", current: 32, alternative: 62 }
    ],
    impact: {
      compatible: [
        { id: "F-8923", name: "Shampoing Doux", type: "Haircare" }
      ],
      minor: [],
      major: [
        { id: "F-8924", name: "Gel Douche Sport", note: "Ajuster booster conservateur" }
      ]
    }
  },
  {
    id: "alt-004",
    substanceId: "sub-002",
    inciName: "Benzyl Alcohol",
    currentlyUsed: false,
    formulasCount: 0,
    markets: ["EU", "US"],
    costComparison: ">",
    pros: ["Bon profil sensoriel", "Compatible bio"],
    cons: ["Allergène parfum"],
    compatibility: {
      overall: 64,
      breakdown: {
        regulatory: 70,
        technical: 75,
        economic: 55,
        formulation: 60
      }
    },
    radar: [
      { criteria: "Coût", current: 70, alternative: 60 },
      { criteria: "Efficacité", current: 60, alternative: 78 },
      { criteria: "Stabilité", current: 68, alternative: 82 },
      { criteria: "Conformité EU", current: 50, alternative: 82 },
      { criteria: "Conformité US", current: 55, alternative: 80 },
      { criteria: "Naturalité", current: 32, alternative: 70 }
    ],
    impact: {
      compatible: [
        { id: "F-8923", name: "Shampoing Doux", type: "Haircare" }
      ],
      minor: [
        { id: "F-8924", name: "Gel Douche Sport", currentPH: 6.5, targetPH: 6.2 }
      ],
      major: [
        { id: "F-9105", name: "Crème Mains Apaisante", note: "Vérifier allergènes 26" }
      ]
    }
  },
  {
    id: "alt-005",
    substanceId: "sub-002",
    inciName: "Caprylyl Glycol",
    currentlyUsed: false,
    formulasCount: 0,
    markets: ["EU", "US", "CN"],
    costComparison: ">",
    pros: ["Effet booster conservateur", "Support sensoriel"],
    cons: ["Surcoût" ],
    compatibility: {
      overall: 70,
      breakdown: {
        regulatory: 85,
        technical: 88,
        economic: 50,
        formulation: 70
      }
    },
    radar: [
      { criteria: "Coût", current: 70, alternative: 55 },
      { criteria: "Efficacité", current: 60, alternative: 88 },
      { criteria: "Stabilité", current: 68, alternative: 90 },
      { criteria: "Conformité EU", current: 50, alternative: 92 },
      { criteria: "Conformité US", current: 55, alternative: 88 },
      { criteria: "Naturalité", current: 32, alternative: 65 }
    ],
    impact: {
      compatible: [
        { id: "F-8923", name: "Shampoing Doux", type: "Haircare" }
      ],
      minor: [
        { id: "F-8924", name: "Gel Douche Sport", currentPH: 6.5, targetPH: 6.3 }
      ],
      major: []
    }
  },
  {
    id: "alt-006",
    substanceId: "sub-002",
    inciName: "Ethylhexylglycerin",
    currentlyUsed: false,
    formulasCount: 0,
    markets: ["EU", "US", "JP"],
    costComparison: "≈",
    pros: ["Synergie conservateurs", "Bon profil microbiologique"],
    cons: ["Nécessite validation sensorielle"],
    compatibility: {
      overall: 82,
      breakdown: {
        regulatory: 92,
        technical: 85,
        economic: 75,
        formulation: 78
      }
    },
    radar: [
      { criteria: "Coût", current: 70, alternative: 70 },
      { criteria: "Efficacité", current: 60, alternative: 90 },
      { criteria: "Stabilité", current: 68, alternative: 92 },
      { criteria: "Conformité EU", current: 50, alternative: 94 },
      { criteria: "Conformité US", current: 55, alternative: 90 },
      { criteria: "Naturalité", current: 32, alternative: 68 }
    ],
    impact: {
      compatible: [
        { id: "F-8923", name: "Shampoing Doux", type: "Haircare" },
        { id: "F-8924", name: "Gel Douche Sport", type: "Bodycare" }
      ],
      minor: [],
      major: []
    }
  }
]

export interface CascadeImpactNode {
  rawMaterial: RawMaterial
  percentageInMaterial: number
  isNonCompliant: boolean
  formulas: Array<{
    formula: Formula
    dosageInFormula: number
    resultingPercentage: number
    isNonCompliant: boolean
    products: Array<{
      product: FinishedProduct
      resultingPercentage: number
      isNonCompliant: boolean
    }>
  }>
}

export interface CascadeImpactSummary {
  rawMaterialsTotal: number
  rawMaterialsNonCompliant: number
  formulasTotal: number
  formulasNonCompliant: number
  productsTotal: number
  productsNonCompliant: number
  businessValueAtRisk: number
}

export interface CascadeImpactData {
  nodes: CascadeImpactNode[]
  summary: CascadeImpactSummary
}

export interface ComplianceRule {
  region: string
  productType: string
  bodyZone: string
  maxPercentage: number | null
  status: "allowed" | "warning" | "forbidden"
  note?: string
}

export type GlobalComplianceStatus =
  | "compliant"
  | "restricted"
  | "non-compliant"
  | "not-listed"
  | "investigate"

export interface GlobalComplianceEntry {
  region: "EU" | "US" | "UK" | "CN" | "ASEAN"
  status: GlobalComplianceStatus
  source: string
  reference: string
  limit?: string
  warning?: string
  action?: string
  updatedAt: string
  matchedIdentifiers: Array<{
    type: "INCI" | "CAS" | "EC"
    value: string
  }>
}

export interface GlobalComplianceMatrix {
  entries: GlobalComplianceEntry[]
  summary: {
    compliant: number
    review: number
    blocked: number
  }
  lastSyncedAt: string
}

export interface RegulatoryTimelineEvent {
  id: string
  substanceId: string
  date: string
  country: string
  type: "restriction" | "approval" | "warning"
  title: string
  description: string
  impact?: {
    formulas: number
    businessValue?: number
  }
  links?: string[]
}

export interface AlternativeOption {
  id: string
  substanceId: string
  inciName: string
  currentlyUsed: boolean
  formulasCount: number
  markets: string[]
  costComparison: "<" | "≈" | ">"
  pros: string[]
  cons: string[]
  compatibility: {
    overall: number
    breakdown: {
      regulatory: number
      technical: number
      economic: number
      formulation: number
    }
  }
  radar: Array<{
    criteria: string
    current: number
    alternative: number
  }>
  impact: {
    compatible: Array<{ id: string; name: string; type: string }>
    minor: Array<{ id: string; name: string; currentPH: number; targetPH: number }>
    major: Array<{ id: string; name: string; note: string }>
  }
}

function calculateResultingPercentage(
  substancePercentage: number,
  materialDosage: number,
  previousPercentage?: number
) {
  const base = (substancePercentage / 100) * (materialDosage / 100)
  if (typeof previousPercentage === "number") {
    return previousPercentage * base
  }
  return base * 100
}

export function getCascadeImpact(substanceId: string, newLimit?: number): CascadeImpactData {
  const nodes: CascadeImpactNode[] = []
  let rawMaterialsNonCompliant = 0
  let formulasNonCompliant = 0
  let productsNonCompliant = 0
  let businessValueAtRisk = 0

  mockRawMaterials.forEach((rawMaterial) => {
    const component = rawMaterial.composition.find(
      (composition) => composition.substanceId === substanceId
    )
    if (!component) return

    const formulas = mockFormulas
      .filter((formula) =>
        formula.materials.some((material) => material.rawMaterialId === rawMaterial.id)
      )
      .map((formula) => {
        const material = formula.materials.find(
          (entry) => entry.rawMaterialId === rawMaterial.id
        )
        const dosageInFormula = material?.dosage ?? 0
        const resultingPercentage = calculateResultingPercentage(
          component.percentage,
          dosageInFormula
        )

        const products = mockFinishedProducts
          .filter((product) => product.formulaId === formula.id)
          .map((product) => {
            const resultingPercentageInProduct = resultingPercentage * 0.6
            const isProductNonCompliant =
              typeof newLimit === "number" && resultingPercentageInProduct > newLimit

            return {
              product,
              resultingPercentage: resultingPercentageInProduct,
              isNonCompliant: isProductNonCompliant
            }
          })

        const isFormulaNonCompliant = typeof newLimit === "number" && resultingPercentage > newLimit
        if (isFormulaNonCompliant) {
          formulasNonCompliant += 1
          products.forEach((entry) => {
            if (entry.isNonCompliant) {
              productsNonCompliant += 1
              businessValueAtRisk += entry.product.businessValue
            }
          })
        }

        return {
          formula,
          dosageInFormula,
          resultingPercentage,
          isNonCompliant: isFormulaNonCompliant,
          products
        }
      })

    const nonCompliantFormula = formulas.some((entry) => {
      if (!entry) return false
      return typeof newLimit === "number" && entry.resultingPercentage > newLimit
    })

    if (nonCompliantFormula) {
      rawMaterialsNonCompliant += 1
    }

    nodes.push({
      rawMaterial,
      percentageInMaterial: component.percentage,
      isNonCompliant: nonCompliantFormula,
      formulas: formulas.filter(Boolean) as CascadeImpactNode["formulas"]
    })
  })

  const summary: CascadeImpactSummary = {
    rawMaterialsTotal: nodes.length,
    rawMaterialsNonCompliant,
    formulasTotal: nodes.reduce((acc, node) => acc + node.formulas.length, 0),
    formulasNonCompliant,
    productsTotal: nodes.reduce(
      (acc, node) =>
        acc + node.formulas.reduce((innerAcc, formula) => innerAcc + formula.products.length, 0),
      0
    ),
    productsNonCompliant,
    businessValueAtRisk
  }

  return {
    nodes,
    summary
  }
}

export function getComplianceRules(substanceId: string): ComplianceRule[] {
  return complianceRulesBySubstance[substanceId] ?? []
}

export function getRegulatoryTimeline(substanceId: string): RegulatoryTimelineEvent[] {
  return regulatoryTimelineEvents
    .filter((event) => event.substanceId === substanceId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAlternatives(substanceId: string) {
  const recommended = alternativeOptions.filter(
    (option) => option.substanceId === substanceId && option.currentlyUsed
  )
  const newOptions = alternativeOptions.filter(
    (option) => option.substanceId === substanceId && !option.currentlyUsed
  )

  return {
    recommended,
    new: newOptions
  }
}

export const incidenceAllergens = [
  "Limonene",
  "Linalool",
  "Citral",
  "Geraniol",
  "Benzyl Alcohol",
  "Coumarin",
  "Farnesol"
]

export const restrictionTypes = ["listed", "unlisted", "regulated", "forbidden"] as const
export const inciPageSizeOptions = [10, 25, 50, 100]
export const pageSizeOptions = [25, 50, 100]

export function getGlobalComplianceMatrix(substance: Substance): GlobalComplianceMatrix {
  const identifiers: GlobalComplianceEntry["matchedIdentifiers"] = [
    substance.inciEU ? { type: "INCI" as const, value: substance.inciEU } : null,
    substance.inciUS && substance.inciUS !== substance.inciEU
      ? { type: "INCI" as const, value: substance.inciUS }
      : null,
    substance.casEinecsPairs?.length ? { type: "CAS" as const, value: substance.casEinecsPairs[0].cas } : null,
    substance.casEinecsPairs?.[0]?.einecs ? { type: "EC" as const, value: substance.casEinecsPairs[0].einecs } : null
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  const entries =
    globalComplianceRegistry[substance.id] ?? buildFallbackComplianceEntries(identifiers)

  const summary = entries.reduce(
    (acc, entry) => {
      if (entry.status === "compliant") {
        acc.compliant += 1
      } else if (entry.status === "restricted" || entry.status === "investigate") {
        acc.review += 1
      } else {
        acc.blocked += 1
      }
      return acc
    },
    { compliant: 0, review: 0, blocked: 0 }
  )

  const lastSyncedTimestamp = entries.reduce((latest, entry) => {
    const timestamp = new Date(entry.updatedAt).getTime()
    if (Number.isNaN(timestamp)) return latest
    return Math.max(latest, timestamp)
  }, 0)

  return {
    entries,
    summary,
    lastSyncedAt: lastSyncedTimestamp ? new Date(lastSyncedTimestamp).toISOString() : new Date().toISOString()
  }
}
