import avatarDirectriceOps from '../assets/images/avatar_directrice_ops_1790585874396.jpg';
import avatarLeadFinance from '../assets/images/avatar_lead_finance_1790585887631.jpg';
import heroSaasWorkspace from '../assets/images/hero_saas_workspace_1790585899719.jpg';

export const ASSETS = {
  avatarDirectriceOps,
  avatarLeadFinance,
  heroSaasWorkspace,
};

export type InvoiceStatus = 'payee' | 'en_attente' | 'en_retard';
export type ProjectStatus = 'en_cours' | 'validation' | 'planifie' | 'termine';
export type BillingCadence = 'Mensuel' | 'Annuel';

export interface InvoiceRecord {
  id: string;
  reference: string;
  clientName: string;
  clientSector: string;
  planName: string;
  cadence: BillingCadence;
  amountHt: number;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  owner: string;
  notes: string;
}

export interface ProjectRecord {
  id: string;
  code: string;
  title: string;
  clientName: string;
  category: string;
  leadName: string;
  status: ProjectStatus;
  loggedHours: number;
  budgetHours: number;
  mrrImpact: number;
  dueDate: string;
  deliverableSummary: string;
}

export interface ClientAccount {
  id: string;
  companyName: string;
  industry: string;
  city: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  tier: 'Croissance' | 'Opérations' | 'Multi-Entités';
  mrr: number;
  seatsUsed: number;
  seatsLimit: number;
  retentionHealth: 'Nominal' | 'Vigilance' | 'Action requise';
  renewalDate: string;
  onboardedSince: string;
}

export interface MonthlyRevenuePoint {
  month: string;
  shortLabel: string;
  mrr: number;
  targetMrr: number;
  operatingCosts: number;
  newClients: number;
  netRetention: number;
}

export const INITIAL_REVENUE_SERIES: MonthlyRevenuePoint[] = [
  { month: 'Avril 2026', shortLabel: 'Avr', mrr: 64200, targetMrr: 62000, operatingCosts: 28400, newClients: 4, netRetention: 108.2 },
  { month: 'Mai 2026', shortLabel: 'Mai', mrr: 69850, targetMrr: 67000, operatingCosts: 29100, newClients: 5, netRetention: 110.4 },
  { month: 'Juin 2026', shortLabel: 'Juin', mrr: 75400, targetMrr: 72000, operatingCosts: 30200, newClients: 6, netRetention: 112.0 },
  { month: 'Juillet 2026', shortLabel: 'Juil', mrr: 81900, targetMrr: 78500, operatingCosts: 31050, newClients: 5, netRetention: 113.5 },
  { month: 'Août 2026', shortLabel: 'Août', mrr: 86300, targetMrr: 84000, operatingCosts: 31800, newClients: 4, netRetention: 114.1 },
  { month: 'Septembre 2026', shortLabel: 'Sept', mrr: 94650, targetMrr: 90000, operatingCosts: 32900, newClients: 7, netRetention: 116.8 },
];

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-1',
    reference: 'VF-2026-0942',
    clientName: 'Atelier Méridien Architecture',
    clientSector: 'Architecture & Ingénierie',
    planName: 'Opérations Pro',
    cadence: 'Annuel',
    amountHt: 14800,
    issuedDate: '02 sept. 2026',
    dueDate: '02 oct. 2026',
    status: 'payee',
    owner: 'Claire Valmont',
    notes: 'Règlement par virement SEPA automatisé. Facture conforme au format Factur-X.',
  },
  {
    id: 'inv-2',
    reference: 'VF-2026-0945',
    clientName: 'Laboratoires Novalys Biotech',
    clientSector: 'Biotechnologie & R&D',
    planName: 'Multi-Entités',
    cadence: 'Mensuel',
    amountHt: 8450,
    issuedDate: '05 sept. 2026',
    dueDate: '05 oct. 2026',
    status: 'en_attente',
    owner: 'Marc Delacroix',
    notes: 'Validation du bon de commande PO-8841 en cours auprès de la direction financière.',
  },
  {
    id: 'inv-3',
    reference: 'VF-2026-0948',
    clientName: 'Groupe Hélianthe Logistique',
    clientSector: 'Transport & Supply Chain',
    planName: 'Multi-Entités',
    cadence: 'Annuel',
    amountHt: 22400,
    issuedDate: '08 sept. 2026',
    dueDate: '08 oct. 2026',
    status: 'payee',
    owner: 'Claire Valmont',
    notes: 'Contrat annuel multi-sites (Lyon, Marseille, Lille) avec connecteur ERP actif.',
  },
  {
    id: 'inv-4',
    reference: 'VF-2026-0951',
    clientName: 'Studio Kinetix Digital',
    clientSector: 'Conseil & Produit Numérique',
    planName: 'Croissance',
    cadence: 'Mensuel',
    amountHt: 3200,
    issuedDate: '15 août 2026',
    dueDate: '15 sept. 2026',
    status: 'en_retard',
    owner: 'Marc Delacroix',
    notes: 'Échéance dépassée de 13 jours. Relance amiable envoyée au service comptabilité.',
  },
  {
    id: 'inv-5',
    reference: 'VF-2026-0956',
    clientName: 'Manufacture Horlogère Vercors',
    clientSector: 'Industrie de Précision',
    planName: 'Opérations Pro',
    cadence: 'Mensuel',
    amountHt: 5900,
    issuedDate: '12 sept. 2026',
    dueDate: '12 oct. 2026',
    status: 'payee',
    owner: 'Claire Valmont',
    notes: 'Prélèvement SEPA Core exécuté sans incident.',
  },
  {
    id: 'inv-6',
    reference: 'VF-2026-0960',
    clientName: 'Cabinet Soler & Associés',
    clientSector: 'Audit & Expertise Comptable',
    planName: 'Opérations Pro',
    cadence: 'Mensuel',
    amountHt: 4650,
    issuedDate: '18 sept. 2026',
    dueDate: '18 oct. 2026',
    status: 'en_attente',
    owner: 'Marc Delacroix',
    notes: 'Facturation mensuelle incluant 18 sièges collaborateurs et export FEC.',
  },
  {
    id: 'inv-7',
    reference: 'VF-2026-0964',
    clientName: 'Verrière Énergie Solaire',
    clientSector: 'Infrastructures Énergétiques',
    planName: 'Multi-Entités',
    cadence: 'Annuel',
    amountHt: 19200,
    issuedDate: '21 sept. 2026',
    dueDate: '21 oct. 2026',
    status: 'payee',
    owner: 'Claire Valmont',
    notes: 'Déploiement complet sur 4 filiales régionales.',
  },
];

export const INITIAL_PROJECTS: ProjectRecord[] = [
  {
    id: 'prj-1',
    code: 'OPS-104',
    title: 'Migration Factur-X & Synchronisation FEC Automatisée',
    clientName: 'Atelier Méridien Architecture',
    category: 'Conformité Financière',
    leadName: 'Claire Valmont',
    status: 'en_cours',
    loggedHours: 68,
    budgetHours: 80,
    mrrImpact: 2400,
    dueDate: '14 oct. 2026',
    deliverableSummary: 'Passerelle de facturation électronique certifiée avec rapprochement bancaire temps réel.',
  },
  {
    id: 'prj-2',
    code: 'OPS-108',
    title: 'Déploiement Portail Fournisseurs Multi-Devises (EUR/CHF)',
    clientName: 'Manufacture Horlogère Vercors',
    category: 'Infrastructure ERP',
    leadName: 'Marc Delacroix',
    status: 'validation',
    loggedHours: 94,
    budgetHours: 100,
    mrrImpact: 3100,
    dueDate: '04 oct. 2026',
    deliverableSummary: 'Gestion automatisée des taux de change et validation des achats matières premières.',
  },
  {
    id: 'prj-3',
    code: 'OPS-112',
    title: 'Consolidation Analytique des 6 Entrepôts Régionaux',
    clientName: 'Groupe Hélianthe Logistique',
    category: 'Analytique & BI',
    leadName: 'Claire Valmont',
    status: 'en_cours',
    loggedHours: 42,
    budgetHours: 90,
    mrrImpact: 4500,
    dueDate: '28 oct. 2026',
    deliverableSummary: 'Tableau de bord de marge opérationnelle par flotte et centre de tri.',
  },
  {
    id: 'prj-4',
    code: 'OPS-115',
    title: 'Automatisation du Recouvrement & Relances Séquencées',
    clientName: 'Studio Kinetix Digital',
    category: 'Trésorerie & Cashflow',
    leadName: 'Marc Delacroix',
    status: 'planifie',
    loggedHours: 12,
    budgetHours: 45,
    mrrImpact: 1250,
    dueDate: '09 nov. 2026',
    deliverableSummary: 'Réduction du délai moyen de paiement client (DSO) de 48 à 22 jours.',
  },
  {
    id: 'prj-5',
    code: 'OPS-098',
    title: 'Audit de Sécurité SOC2 & Contrôle des Accès Par Rôle',
    clientName: 'Laboratoires Novalys Biotech',
    category: 'Sécurité & Gouvernance',
    leadName: 'Claire Valmont',
    status: 'termine',
    loggedHours: 60,
    budgetHours: 60,
    mrrImpact: 2800,
    dueDate: '20 sept. 2026',
    deliverableSummary: 'Journalisation immuable des écritures et permissions granulaires par laboratoire.',
  },
];

export const INITIAL_CLIENTS: ClientAccount[] = [
  {
    id: 'cli-1',
    companyName: 'Groupe Hélianthe Logistique',
    industry: 'Transport & Supply Chain',
    city: 'Lyon, France',
    contactName: 'Éléonore Garnier',
    contactRole: 'Directrice Administrative & Financière',
    contactEmail: 'e.garnier@helianthe-logistique.fr',
    tier: 'Multi-Entités',
    mrr: 4500,
    seatsUsed: 46,
    seatsLimit: 50,
    retentionHealth: 'Nominal',
    renewalDate: '01 janv. 2027',
    onboardedSince: 'Mars 2025',
  },
  {
    id: 'cli-2',
    companyName: 'Laboratoires Novalys Biotech',
    industry: 'Biotechnologie & R&D',
    city: 'Strasbourg, France',
    contactName: 'Dr. Henri Vasseur',
    contactRole: 'VP Opérations Scientifiques',
    contactEmail: 'h.vasseur@novalys-bio.eu',
    tier: 'Multi-Entités',
    mrr: 3850,
    seatsUsed: 34,
    seatsLimit: 50,
    retentionHealth: 'Vigilance',
    renewalDate: '15 nov. 2026',
    onboardedSince: 'Juin 2025',
  },
  {
    id: 'cli-3',
    companyName: 'Atelier Méridien Architecture',
    industry: 'Architecture & Ingénierie',
    city: 'Bordeaux, France',
    contactName: 'Sébastien Morel',
    contactRole: 'Associé Gérant',
    contactEmail: 's.morel@atelier-meridien.fr',
    tier: 'Opérations',
    mrr: 2400,
    seatsUsed: 19,
    seatsLimit: 25,
    retentionHealth: 'Nominal',
    renewalDate: '02 oct. 2027',
    onboardedSince: 'Octobre 2024',
  },
  {
    id: 'cli-4',
    companyName: 'Manufacture Horlogère Vercors',
    industry: 'Industrie de Précision',
    city: 'Besançon, France',
    contactName: 'Mathilde Rocher',
    contactRole: 'Responsable Contrôle de Gestion',
    contactEmail: 'm.rocher@horlogerie-vercors.fr',
    tier: 'Opérations',
    mrr: 2950,
    seatsUsed: 22,
    seatsLimit: 25,
    retentionHealth: 'Nominal',
    renewalDate: '01 avr. 2027',
    onboardedSince: 'Avril 2025',
  },
  {
    id: 'cli-5',
    companyName: 'Studio Kinetix Digital',
    industry: 'Conseil & Produit Numérique',
    city: 'Paris, France',
    contactName: 'Lucas Chavanne',
    contactRole: 'Directeur des Opérations',
    contactEmail: 'l.chavanne@kinetix-studio.io',
    tier: 'Croissance',
    mrr: 1250,
    seatsUsed: 9,
    seatsLimit: 10,
    retentionHealth: 'Action requise',
    renewalDate: '01 nov. 2026',
    onboardedSince: 'Janvier 2026',
  },
];

export interface PricingTier {
  id: string;
  audienceLabel: string;
  name: string;
  monthlyPrice: number;
  annualMonthlyEquivalent: number;
  description: string;
  ctaLabel: string;
  featured?: boolean;
  metrics: {
    usersLimit: string;
    invoicesPerMonth: string;
    bankSync: string;
    exportFormat: string;
    slaSupport: string;
  };
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-launch',
    audienceLabel: 'Pour les équipes en lancement',
    name: 'Plan Croissance',
    monthlyPrice: 290,
    annualMonthlyEquivalent: 230,
    description: 'Centralisation de la facturation récurrente, suivi des temps facturables et relances clients automatisées pour les structures de 5 à 15 personnes.',
    ctaLabel: 'Activer le Plan Croissance',
    metrics: {
      usersLimit: 'Jusqu’à 10 collaborateurs inclus',
      invoicesPerMonth: '150 factures Factur-X / mois',
      bankSync: '2 comptes bancaires synchronisés (DSP2)',
      exportFormat: 'Export CSV & Journal FEC standard',
      slaSupport: 'Réponse garantie sous 8h ouvrées',
    },
  },
  {
    id: 'tier-scale',
    audienceLabel: 'Pour les opérations en croissance',
    name: 'Plan Opérations Pro',
    monthlyPrice: 680,
    annualMonthlyEquivalent: 540,
    description: 'Pilotage analytique du MRR, contrôle budgétaire par projet client, workflows d’approbation des achats et rapprochement bancaire temps réel.',
    ctaLabel: 'Passer sur Opérations Pro',
    featured: true,
    metrics: {
      usersLimit: 'Jusqu’à 25 collaborateurs inclus',
      invoicesPerMonth: '1 000 factures Factur-X / mois',
      bankSync: '10 comptes bancaires multi-devises (EUR, CHF, USD)',
      exportFormat: 'Export FEC enrichi, API REST & Webhooks',
      slaSupport: 'Réponse garantie sous 2h + Gestionnaire dédié',
    },
  },
  {
    id: 'tier-enterprise',
    audienceLabel: 'Pour les groupes multi-entités',
    name: 'Plan Multi-Entités',
    monthlyPrice: 1450,
    annualMonthlyEquivalent: 1160,
    description: 'Consolidation financière multi-filiales, permissions granulaires par centre de coût, piste d’audit immuable et intégration ERP sur mesure.',
    ctaLabel: 'Planifier un audit d’intégration',
    metrics: {
      usersLimit: 'Collaborateurs illimités & SSO SAML',
      invoicesPerMonth: 'Volume illimité & Mandats SEPA Core/B2B',
      bankSync: 'Comptes illimités + Connexion EBICS TS',
      exportFormat: 'Connecteurs natifs NetSuite, Sage 100 & Cegid',
      slaSupport: 'SLA 99,95 % contractuel & Support 24/7',
    },
  },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}
