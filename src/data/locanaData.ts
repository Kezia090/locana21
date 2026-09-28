export type PropertyCategory = 'Appartement' | 'Maison' | 'Chambre' | 'Studio' | 'Autre';

export type PaymentChannel =
  | 'Orange Money'
  | 'Wave Mobile'
  | 'MTN MoMo'
  | 'Airtel Money'
  | 'Virement Bancaire (Grandes sommes)'
  | 'Chèque Certifié'
  | 'Espèces / Reçu';

export type IncidentStage =
  | 'signale'       // Signalé par locataire / diagnostic en cours
  | 'devis_recu'    // Devis chiffré en attente de validation propriétaire
  | 'valide'        // Devis validé, artisan en intervention
  | 'facture'       // Intervention terminée, facture reçue, en attente de libération des fonds
  | 'paye';         // Fonds libérés et artisan réglé

export interface UtilityChargeItem {
  id: string;
  category: string; // 'Électricité' | 'Eau' | 'Internet' | custom label
  amount: number;
  meterIndexPrev?: number;
  meterIndexCurr?: number;
  consumptionUnits?: string; // ex: '112 kWh' or '9 m³'
  periodLabel: string;
  paid: boolean;
}

export interface IncidentItem {
  id: string;
  ticketNumber: number;
  propertyId: string;
  propertyName: string;
  groupName: string | null;
  category: string; // 'Plomberie' | 'Électricité' | 'Toiture' | custom
  title: string;
  tenantMessage: string;
  providerName: string;
  providerPhone: string;
  quoteAmount: number;       // Devis ($)
  approvedAmount: number | null; // Validé ($)
  invoiceAmount: number | null;  // Facture finale ($)
  paidAmount: number | null;     // Payé ($)
  stage: IncidentStage;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryLedgerEntry {
  id: string;
  propertyId: string;
  groupName: string | null;
  date: string;
  type: 'loyer' | 'charge' | 'incident' | 'occupation' | 'communication';
  title: string;
  detail: string;
  amount?: number;
  direction?: 'entree' | 'sortie' | 'info';
  channel?: string;
}

export interface PropertyUnit {
  id: string;
  name: string;               // ex: "Appartement 12", "Villa Les Hibiscus"
  category: PropertyCategory;
  customCategoryLabel?: string; // si category === 'Autre'
  groupName: string | null;   // ex: "Immeuble A", "Immeuble B", ou null si Maison isolée
  occupied: boolean;
  tenantName: string;
  tenantPhone: string;
  leaseStart: string;
  rentAmount: number;         // Loyer de base ($)
  rentStatus: 'paye' | 'en_attente' | 'partiel';
  lastPaymentChannel?: PaymentChannel;
  lastPaymentRef?: string;
  meterWeightKwh: number;     // Relevé / consommation kWh du mois pour répartition intelligente
  waterWeightM3: number;      // Relevé m³ d'eau
  charges: UtilityChargeItem[];
  agencyMandateActive?: boolean;
  selectedAgencyName?: string;
}

export interface PartnerAgency {
  id: string;
  name: string;
  specialty: string;
  avgPlacementDays: number;
  feeStructure: string;
  phone: string;
}

export const PARTNER_AGENCIES: PartnerAgency[] = [
  {
    id: 'ag-1',
    name: 'Agence Horizon Patrimoine',
    specialty: 'Appartements & Immeubles de rapport',
    avgPlacementDays: 9,
    feeStructure: '50 % du 1er mois à la signature',
    phone: '+243 81 440 12 90',
  },
  {
    id: 'ag-2',
    name: 'Kivu & Plateau Immobilier',
    specialty: 'Maisons isolées, Villas & Locaux',
    avgPlacementDays: 12,
    feeStructure: 'Forfait fixe 120 $ après entrée locataire',
    phone: '+243 99 210 88 45',
  },
  {
    id: 'ag-3',
    name: 'LocExpress Certifié',
    specialty: 'Relocation rapide Studios & Chambres (Vérification solvable)',
    avgPlacementDays: 6,
    feeStructure: '40 % du 1er loyer · Garantie loyers 6 mois',
    phone: '+243 82 905 33 11',
  },
];

export const INITIAL_PROPERTIES: PropertyUnit[] = [
  {
    id: 'prop-12',
    name: 'Appartement 12',
    category: 'Appartement',
    groupName: 'Immeuble A',
    occupied: true,
    tenantName: 'Samuel Kabongo',
    tenantPhone: '+243 81 302 45 19',
    leaseStart: '01 janv. 2025',
    rentAmount: 250,
    rentStatus: 'paye',
    lastPaymentChannel: 'Orange Money',
    lastPaymentRef: 'OM-2609-88412',
    meterWeightKwh: 142,
    waterWeightM3: 9,
    charges: [
      {
        id: 'chg-12-elec',
        category: 'Électricité',
        amount: 38,
        meterIndexPrev: 4120,
        meterIndexCurr: 4262,
        consumptionUnits: '142 kWh + quote-part communs',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
      {
        id: 'chg-12-eau',
        category: 'Eau',
        amount: 12,
        meterIndexPrev: 118,
        meterIndexCurr: 127,
        consumptionUnits: '9 m³',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
    ],
  },
  {
    id: 'prop-1',
    name: 'Appartement 1',
    category: 'Appartement',
    groupName: 'Immeuble A',
    occupied: true,
    tenantName: 'Nadine Ilunga',
    tenantPhone: '+243 99 415 72 08',
    leaseStart: '15 mars 2025',
    rentAmount: 250,
    rentStatus: 'paye',
    lastPaymentChannel: 'Wave Mobile',
    lastPaymentRef: 'WV-2609-10944',
    meterWeightKwh: 140,
    waterWeightM3: 8,
    charges: [
      {
        id: 'chg-1-elec',
        category: 'Électricité',
        amount: 38,
        meterIndexPrev: 2890,
        meterIndexCurr: 3030,
        consumptionUnits: '140 kWh + quote-part communs',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
      {
        id: 'chg-1-eau',
        category: 'Eau',
        amount: 11,
        meterIndexPrev: 84,
        meterIndexCurr: 92,
        consumptionUnits: '8 m³',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
    ],
  },
  {
    id: 'prop-2',
    name: 'Appartement 2',
    category: 'Appartement',
    groupName: 'Immeuble A',
    occupied: true,
    tenantName: 'Dr. Patrick Mwamba',
    tenantPhone: '+243 82 611 09 34',
    leaseStart: '01 juin 2024',
    rentAmount: 320,
    rentStatus: 'en_attente',
    meterWeightKwh: 192,
    waterWeightM3: 13,
    charges: [
      {
        id: 'chg-2-elec',
        category: 'Électricité',
        amount: 51,
        meterIndexPrev: 6410,
        meterIndexCurr: 6602,
        consumptionUnits: '192 kWh + quote-part communs',
        periodLabel: 'Septembre 2026',
        paid: false,
      },
      {
        id: 'chg-2-eau',
        category: 'Eau',
        amount: 16,
        meterIndexPrev: 205,
        meterIndexCurr: 218,
        consumptionUnits: '13 m³',
        periodLabel: 'Septembre 2026',
        paid: false,
      },
    ],
  },
  {
    id: 'prop-3',
    name: 'Appartement 3',
    category: 'Appartement',
    groupName: 'Immeuble A',
    occupied: true,
    tenantName: 'Clarisse Mutombo',
    tenantPhone: '+243 81 778 21 60',
    leaseStart: '01 oct. 2025',
    rentAmount: 220,
    rentStatus: 'paye',
    lastPaymentChannel: 'Airtel Money',
    lastPaymentRef: 'AM-2609-55301',
    meterWeightKwh: 98,
    waterWeightM3: 6,
    charges: [
      {
        id: 'chg-3-elec',
        category: 'Électricité',
        amount: 27,
        meterIndexPrev: 1520,
        meterIndexCurr: 1618,
        consumptionUnits: '98 kWh + quote-part communs',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
      {
        id: 'chg-3-eau',
        category: 'Eau',
        amount: 9,
        meterIndexPrev: 60,
        meterIndexCurr: 66,
        consumptionUnits: '6 m³',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
    ],
  },
  {
    id: 'prop-maison-1',
    name: 'Villa Les Acacias (Lot 4)',
    category: 'Maison',
    groupName: null, // Maison isolée (pas d'immeuble)
    occupied: true,
    tenantName: 'Famille Jean-Luc Kasongo',
    tenantPhone: '+243 99 004 82 15',
    leaseStart: '01 févr. 2024',
    rentAmount: 850,
    rentStatus: 'paye',
    lastPaymentChannel: 'Virement Bancaire (Grandes sommes)',
    lastPaymentRef: 'VIR-RAWBANK-99204',
    meterWeightKwh: 310,
    waterWeightM3: 22,
    charges: [
      {
        id: 'chg-m1-elec',
        category: 'Électricité',
        amount: 78,
        meterIndexPrev: 8900,
        meterIndexCurr: 9210,
        consumptionUnits: '310 kWh (Compteur individuel)',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
      {
        id: 'chg-m1-sec',
        category: 'Gardiennage & Forfait Eau',
        amount: 45,
        consumptionUnits: 'Forfait mensuel',
        periodLabel: 'Septembre 2026',
        paid: true,
      },
    ],
  },
  {
    id: 'prop-maison-2',
    name: 'Maison Pavillon Ngaliema',
    category: 'Maison',
    groupName: null, // Maison isolée vacante pour démontrer la vacance + suggestion d'agence
    occupied: false,
    tenantName: '',
    tenantPhone: '',
    leaseStart: 'Sortie le 24 sept. 2026',
    rentAmount: 600,
    rentStatus: 'en_attente',
    meterWeightKwh: 15,
    waterWeightM3: 2,
    charges: [
      {
        id: 'chg-m2-elec',
        category: 'Électricité (Veille compteur)',
        amount: 9,
        consumptionUnits: '15 kWh',
        periodLabel: 'Septembre 2026',
        paid: false,
      },
    ],
  },
  {
    id: 'prop-autre-1',
    name: 'Atelier & Dépôt Commercial Sud',
    category: 'Autre',
    customCategoryLabel: 'Entrepôt & Boutique',
    groupName: 'Immeuble B',
    occupied: true,
    tenantName: 'Société Kivu Logistique SARL',
    tenantPhone: '+243 81 555 90 00',
    leaseStart: '01 mai 2025',
    rentAmount: 1100,
    rentStatus: 'en_attente',
    meterWeightKwh: 420,
    waterWeightM3: 14,
    charges: [
      {
        id: 'chg-a1-elec',
        category: 'Électricité Triphasée',
        amount: 115,
        consumptionUnits: '420 kWh',
        periodLabel: 'Septembre 2026',
        paid: false,
      },
      {
        id: 'chg-a1-gen',
        category: 'Carburant Groupe Électrogène',
        amount: 65,
        consumptionUnits: 'Quote-part secours',
        periodLabel: 'Septembre 2026',
        paid: false,
      },
    ],
  },
];

export const INITIAL_INCIDENTS: IncidentItem[] = [
  {
    id: 'inc-184',
    ticketNumber: 184,
    propertyId: 'prop-12',
    propertyName: 'Appartement 12',
    groupName: 'Immeuble A',
    category: 'Plomberie',
    title: 'Fuite robinet cuisine',
    tenantMessage: '« La fuite vient de la cuisine, sous le siphon de l’évier principal. »',
    providerName: 'Atelier Plomberie Maître Didier',
    providerPhone: '+243 81 229 40 10',
    quoteAmount: 45,
    approvedAmount: 45,
    invoiceAmount: 40,
    paidAmount: null,
    stage: 'facture', // Facturé 40 $ (inférieur au devis de 45 $), en attente de libération des fonds par le propriétaire !
    createdAt: '25 sept. 2026 · 09:15',
    updatedAt: '27 sept. 2026 · 16:40',
  },
  {
    id: 'inc-181',
    ticketNumber: 181,
    propertyId: 'prop-1',
    propertyName: 'Appartement 1',
    groupName: 'Immeuble A',
    category: 'Plomberie',
    title: 'Remplacement joint & flexible cuisine',
    tenantMessage: '« Pression faible et suintement au niveau du mur cuisine. »',
    providerName: 'Atelier Plomberie Maître Didier',
    providerPhone: '+243 81 229 40 10',
    quoteAmount: 65,
    approvedAmount: 65,
    invoiceAmount: 62,
    paidAmount: 62,
    stage: 'paye', // Exemple exact du brief : Devis 65 $ -> Validé 65 $ -> Facture 62 $ -> Payé 62 $
    createdAt: '14 sept. 2026 · 11:00',
    updatedAt: '16 sept. 2026 · 17:20',
  },
  {
    id: 'inc-185',
    ticketNumber: 185,
    propertyId: 'prop-2',
    propertyName: 'Appartement 2',
    groupName: 'Immeuble A',
    category: 'Électricité',
    title: 'Disjoncteur divisionnaire climatisation',
    tenantMessage: '« Le disjoncteur de la chambre principale saute dès qu’on allume le split. »',
    providerName: 'ÉlecPro Services Certifiés',
    providerPhone: '+243 99 812 33 04',
    quoteAmount: 55,
    approvedAmount: null,
    invoiceAmount: null,
    paidAmount: null,
    stage: 'devis_recu', // En attente d'acceptation du devis gratuit par le propriétaire
    createdAt: '28 sept. 2026 · 08:30',
    updatedAt: '28 sept. 2026 · 10:05',
  },
  {
    id: 'inc-179',
    ticketNumber: 179,
    propertyId: 'prop-maison-1',
    propertyName: 'Villa Les Acacias (Lot 4)',
    category: 'Autre : Portail Motorisé',
    groupName: null,
    title: 'Réglage fin de course portail électrique',
    tenantMessage: '« Le battant droit du portail extérieur se bloque à mi-course. »',
    providerName: 'Serrurerie & Automatisme Kivu',
    providerPhone: '+243 82 110 49 88',
    quoteAmount: 90,
    approvedAmount: 90,
    invoiceAmount: 85,
    paidAmount: 85,
    stage: 'paye',
    createdAt: '08 sept. 2026 · 14:10',
    updatedAt: '10 sept. 2026 · 18:00',
  },
];

export const INITIAL_HISTORY: HistoryLedgerEntry[] = [
  {
    id: 'hist-1',
    propertyId: 'prop-12',
    groupName: 'Immeuble A',
    date: '27 sept. 2026 · 16:40',
    type: 'incident',
    title: 'Facture finale reçue — Incident #184 (Fuite robinet)',
    detail: 'Devis initial : 45 $ → Intervention facturée : 40 $ (Économie : 5 $). En attente de libération des fonds.',
    amount: 40,
    direction: 'sortie',
    channel: 'Atelier Plomberie Maître Didier',
  },
  {
    id: 'hist-2',
    propertyId: 'prop-12',
    groupName: 'Immeuble A',
    date: '05 sept. 2026 · 10:12',
    type: 'loyer',
    title: 'Règlement Loyer + Électricité (38 $) + Eau (12 $)',
    detail: 'Confirmation automatique Webhook Mobile Money · Réf OM-2609-88412.',
    amount: 300,
    direction: 'entree',
    channel: 'Orange Money',
  },
  {
    id: 'hist-3',
    propertyId: 'prop-maison-1',
    groupName: null,
    date: '04 sept. 2026 · 15:05',
    type: 'loyer',
    title: 'Règlement Loyer Villa Les Acacias + Charges (973 $)',
    detail: 'Virement bancaire grandes sommes rapproché · Réf VIR-RAWBANK-99204.',
    amount: 973,
    direction: 'entree',
    channel: 'Virement Bancaire (Grandes sommes)',
  },
  {
    id: 'hist-4',
    propertyId: 'prop-maison-2',
    groupName: null,
    date: '24 sept. 2026 · 11:30',
    type: 'occupation',
    title: 'État des lieux de sortie — Passage en statut Vacant',
    detail: 'Maison Pavillon Ngaliema disponible à la relocation. Suggestions d’agences activées.',
    direction: 'info',
  },
  {
    id: 'hist-5',
    propertyId: 'prop-1',
    groupName: 'Immeuble A',
    date: '16 sept. 2026 · 17:20',
    type: 'incident',
    title: 'Fonds libérés — Incident #181 (Fuite cuisine)',
    detail: 'Traçabilité complète : Devis 65 $ → Validé 65 $ → Facture 62 $ → Payé 62 $.',
    amount: 62,
    direction: 'sortie',
    channel: 'Orange Money Pro Artisan',
  },
];

export function formatUsd(amount: number): string {
  return `${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })} $`;
}
