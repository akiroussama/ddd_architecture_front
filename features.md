# Features Overview

Cette fiche suit l'évolution des fonctionnalités différenciantes de la maquette GeberGuard PLM. Chaque entrée inclut l’objectif utilisateur, la proposition de valeur et le scénario de démo recommandé.

## 1. Cascade Impact System™
- **Problème** : analyser l’impact d’un changement de restriction sur toute la chaîne prenait 2 à 3 jours aux experts.
- **Solution** : simulateur en cascade (substance → matières premières → formules → produits) avec recommandations, valeur business à risque, actions en un clic.
- **Démo** : ouvrir une substance critique (ex. `Parfum`), cliquer sur « Simuler cascade », descendre la limite à 1 % et montrer les MP/Formules/Produits qui passent au rouge, la valeur business exposée, puis déclencher « Appliquer & notifier ».

## 2. Préparation Dossier & Radars Conformité
- **Problème** : difficile de savoir si un dossier est prêt pour un comité PLM / marketing.
- **Solution** : quick stats + checklist readiness, radar réglementaire multi-régions, actions de partage en un clic.
- **Démo** : sur la même fiche, montrer la jauge `Préparation dossier`, dérouler le radar « Veille réglementaire », exporter la tâche calendrier.

## 3. Where Used – Traçabilité inverse instantanée
- **Problème** : identifier où une substance est utilisée exigeait plusieurs exports et recherches manuelles.
- **Solution** : onglet « Where Used » consolidant MP, formules, produits (filtrage, exports, rapport d’impact, distribution par marché).
- **Démo** : ouvrir l’onglet, faire défiler la section matières premières (mentionner le fournisseur), filtrer les formules critiques et générer un rapport d’impact.

## 4. Calculateur conformité multi-zones
- **Problème** : valider un dosage multi-pays demandait l'ouverture de plusieurs PDF réglementaires.
- **Solution** : calculateur dynamique (concentration + type produit + zone) affichant statut par région avec messages contextualisés.
- **Démo** : saisir 2.5 %, choisir `Leave-on` et `Visage`, montrer EU ✅, US 🔴, China 🟠, Japan ✅.

## 5. Assistant formulation instantané
- **Problème** : difficile de voir en un coup d’œil si le dosage cible reste conforme sur plusieurs marchés.
- **Solution** : bloc interactif (sélection marché + type) qui calcule marges, restrictions et références.
- **Démo** : modifier le dosage cible, sélectionner EU/US/China et montrer la variation des badges.

## 6. Comparatif substances proches
- **Problème** : trouver rapidement une alternative compatible avec les contraintes.
- **Solution** : onglet de comparaison listant des ingrédients similaires avec leurs restrictions.
- **Démo** : ouvrir le bloc, comparer deux alternatives et démontrer la navigation rapide vers leurs fiches.

## 7. Centre documentaire avec alertes d'expiration
- **Problème** : vérifier la validité des certificats et FDS prenait du temps et augmente le risque de non-conformité.
- **Solution** : regroupement critère/technique/réglementaire avec badges d’expiration, alerte globale (J-30), actions “Télécharger / Renouveler”.
- **Démo** : afficher l’alerte orange, montrer `MSDS v3.2` (15 jours), déclencher “Renouveler” pour démontrer l’automatisation.

## 8. Timeline des changements réglementaires
- **Problème** : difficile de se remémorer rapidement les modifications (interdictions, warnings, opportunités) sur 12/24 mois.
- **Solution** : onglet “Historique” en timeline verticale, code couleur (🔴🟠🟢), impacts chiffrés, lien vers plan d’action.
- **Démo** : basculer sur “Historique”, zoomer sur l’événement du 15 oct (China), puis sur la baisse EU du 2 sept et cliquer “Plan d’action”.

## 9. Alternatives validées (Cross-Reference)
- **Problème** : identifier rapidement par quoi remplacer une substance en cas de restriction.
- **Solution** : onglet “Alternatives” séparant les ingrédients déjà utilisés vs validés mais non exploités, avec coûts relatifs, pros/cons, actions “Comparer / Demander échantillon”.
- **Démo** : montrer la section “Recommandées”, souligner `Phenoxyethanol` (126 formules), puis ouvrir “Alternatives validées” et cliquer “Demander échantillon” sur `Benzyl Alcohol`.

## 10. Smart Document Processor (CoA, MSDS, TDS…)
- **Problème** : les experts perdaient 8 à 10 h/semaine à ouvrir chaque PDF, copier les données et ressaisir manuellement les informations clés dans la fiche substance.
- **Solution** : nouvel onglet “Smart Documents” avec upload intelligent, extraction IA (94 % de confiance moyenne), mise en correspondance automatique des substances et validation assistée (badges de confiance, focus sur les champs à vérifier), plus un historique d’imports.
- **Démo** : glisser-déposer trois CoA, laisser l’animation de traitement, montrer la détection automatique de `Phenoxyethanol` (CAS, matching système), corriger rapidement un champ orange puis cliquer sur “Validate & Import” pour mettre à jour l’historique.

## 11. Main Dashboard (Heatmap + Timeline + Pulse)
- **Problème** : les responsables régulatoires passaient 15 min chaque matin à recouper plusieurs rapports pour identifier les urgences substances, expirations et risques fournisseurs.
- **Solution** : nouvel onglet “Main Dashboard” par défaut avec cinq widgets critiques : Risk Heatmap (marchés vs substances), Formulation Impact Meters (CA impacté par statut), Expiry Timeline (documents à échéance), Regulatory Pulse (veille priorisée) et Supplier Intelligence Map (dépendances fournisseurs).
- **Démo** : ouvrir l’onglet “Main Dashboard”, cliquer sur le bloc `Risk Heatmap` (TiO2 🔴 EU) pour filtrer la bibliothèque, survoler la `Expiry Timeline` pour montrer un MSDS J-7, déclencher “Action requise” dans `Regulatory Pulse`, puis basculer vers Smart Documents via le bouton flottant.

## 12. Analyse d'Impact Réglementaire Proactive (“Reg-watch”)
- **Problème** : une alerte réglementaire nécessitait des jours d’analyse manuelle pour identifier les formules impactées, chiffrer le risque business et initier les projets de reformulation.
- **Solution** : module “Reg-watch Impact Planner” qui relie la veille réglementaire (#16) à tout le portefeuille : chaque alerte future calcule automatiquement les formules concernées, valorise le chiffre d’affaires à risque, propose un plan de mitigation (budget, durée, kickoff) et prépare le dossier projet.
- **Démo** : dans le Main Dashboard, repérer l’alerte “Limite leave-on réduite”, visualiser les 23 formules à risque (2.3 M€ CA), cliquer sur “Diagnostiquer” pour filtrer la bibliothèque puis lancer “Créer projet” afin de générer le plan de reformulation (budget estimé, échéancier, équipe).

## 13. Compliance globale multi-région en temps réel
- **Problème** : vérifier manuellement une substance sur chaque base règlementaire (CosIng, MOCRA, UK CPR, IECIC, ASEAN) est chronophage et source d’erreurs, retardant les lancements internationaux.
- **Solution** : service d’agrégation multi-base qui mappe automatiquement INCI/CAS/EC, interroge les référentiels et affiche une vue comparative unique (colonnes par région, lignes Statut/Limite/Avertissements/Source/Action). L’interface montre immédiatement les divergences (ex. « UE : Conforme », « USA : Conforme », « Chine : NON-CONFORME – non listé IECIC »).
- **Démo** : ouvrir une substance depuis la fiche R&D, observer le tableau comparatif (EU/US/UK/CN/ASEAN) : badge vert pour l’UE, orange pour les USA (limite 2 %), rouge pour la Chine (« Interdit – IECIC »). Cliquer sur « Diagnostiquer » pour voir les recommandations d’actions (substitution, adaptation d’étiquetage) et décider instantanément d’écarter la substance du scope global.

> Mettre à jour ce fichier lors de chaque ajout de fonctionnalité : description, valeur et scénario de démo pour les commerciaux / experts.
