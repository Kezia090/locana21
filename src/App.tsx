import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_PROPERTIES,
  INITIAL_INCIDENTS,
  INITIAL_HISTORY,
  PARTNER_AGENCIES,
  PropertyUnit,
  PropertyCategory,
  IncidentItem,
  HistoryLedgerEntry,
  PaymentChannel,
  formatUsd,
} from './data/locanaData';
import { ASSETS } from './data/saasData';
import { ResilientImage } from './components/ResilientImage';
import { UtilitySplitterSection } from './components/UtilitySplitterSection';
import { TenantPortalView } from './components/TenantPortalView';
import {
  Plus,
  Check,
  Wrench,
  Zap,
  Building2,
  Home,
  History,
  Smartphone,
  ShieldCheck,
  Search,
  X,
  Download,
  ArrowRight,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';

type ActiveTab =
  | 'patrimoine'
  | 'repartition'
  | 'incidents'
  | 'historique'
  | 'locataire';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('patrimoine');

  // Persistent state in localStorage
  const [properties, setProperties] = useState<PropertyUnit[]>(() => {
    try {
      const saved = localStorage.getItem('locana_properties_v1');
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [incidents, setIncidents] = useState<IncidentItem[]>(() => {
    try {
      const saved = localStorage.getItem('locana_incidents_v1');
      return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  });

  const [history, setHistory] = useState<HistoryLedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem('locana_history_v1');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  // Global Landlord Automation Toggles
  const [autoReleaseFunds, setAutoReleaseFunds] = useState<boolean>(false);
  const [autoSuggestions, setAutoSuggestions] = useState<boolean>(true);

  useEffect(() => {
    try {
      localStorage.setItem('locana_properties_v1', JSON.stringify(properties));
    } catch {
      // ignore storage quota errors
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('locana_incidents_v1', JSON.stringify(incidents));
    } catch {
      // ignore storage quota errors
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem('locana_history_v1', JSON.stringify(history));
    } catch {
      // ignore storage quota errors
    }
  }, [history]);

  // Filters & Selections
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHistoryScope, setSelectedHistoryScope] = useState<string>('prop-12');
  const [authenticatedTenantPropId, setAuthenticatedTenantPropId] = useState<string | null>(null);
  const [isIsolatedTenantMode, setIsIsolatedTenantMode] = useState<boolean>(true);

  // Inline "+ Incident" form state per property card (avoids browser dialogs!)
  const [inlineIncidentPropId, setInlineIncidentPropId] = useState<string | null>(null);
  const [inlineIncCategory, setInlineIncCategory] = useState<string>('Plomberie');
  const [inlineIncCustomCat, setInlineIncCustomCat] = useState<string>('');
  const [inlineIncTitle, setInlineIncTitle] = useState<string>('');
  const [inlineIncMessage, setInlineIncMessage] = useState<string>('');
  const [inlineIncQuote, setInlineIncQuote] = useState<string>('45');

  // Inline Payment channel selector per property card
  const [paymentModalProp, setPaymentModalProp] = useState<PropertyUnit | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('Orange Money');

  // Add New Property Modal state
  const [isAddPropOpen, setIsAddPropOpen] = useState<boolean>(false);
  const [newPropName, setNewPropName] = useState<string>('');
  const [newPropCategory, setNewPropCategory] = useState<PropertyCategory>('Appartement');
  const [newPropCustomCategory, setNewPropCustomCategory] = useState<string>('');
  const [newPropGroupMode, setNewPropGroupMode] = useState<'existing' | 'isolated' | 'custom'>('existing');
  const [newPropGroupName, setNewPropGroupName] = useState<string>('Immeuble A');
  const [newPropCustomGroup, setNewPropCustomGroup] = useState<string>('');
  const [newPropOccupied, setNewPropOccupied] = useState<boolean>(true);
  const [newPropTenant, setNewPropTenant] = useState<string>('');
  const [newPropPhone, setNewPropPhone] = useState<string>('');
  const [newPropRent, setNewPropRent] = useState<string>('280');
  const [addPropError, setAddPropError] = useState<string>('');

  // Custom single charge inline state per property card
  const [inlineChargePropId, setInlineChargePropId] = useState<string | null>(null);
  const [inlineChargePreset, setInlineChargePreset] = useState<string>('Électricité');
  const [inlineChargeCustomLabel, setInlineChargeCustomLabel] = useState<string>('');
  const [inlineChargeAmount, setInlineChargeAmount] = useState<string>('35');

  // Feedback toast banner
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedbackNotice(msg);
    window.setTimeout(() => {
      setFeedbackNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Distinct building groups
  const buildingGroups = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.groupName) set.add(p.groupName);
    });
    return Array.from(set);
  }, [properties]);

  // Global & Building-level Metrics
  const globalStats = useMemo(() => {
    const occupiedUnits = properties.filter((p) => p.occupied);
    const vacantUnits = properties.filter((p) => !p.occupied);

    const expectedRentTotal = occupiedUnits.reduce((acc, p) => acc + p.rentAmount, 0);
    const collectedRentTotal = occupiedUnits
      .filter((p) => p.rentStatus === 'paye')
      .reduce((acc, p) => acc + p.rentAmount, 0);

    const rentCollectionPct =
      expectedRentTotal > 0
        ? Math.round((collectedRentTotal / expectedRentTotal) * 100)
        : 0;

    const totalUtilitiesBilled = properties.reduce(
      (acc, p) => acc + p.charges.reduce((s, c) => s + c.amount, 0),
      0
    );

    const maintenancePaidTotal = incidents
      .filter((i) => i.stage === 'paye')
      .reduce((acc, i) => acc + (i.paidAmount || i.invoiceAmount || i.quoteAmount), 0);

    const pendingFundReleaseCount = incidents.filter(
      (i) => i.stage === 'facture'
    ).length;

    const pendingFundReleaseSum = incidents
      .filter((i) => i.stage === 'facture')
      .reduce((acc, i) => acc + (i.invoiceAmount || i.quoteAmount), 0);

    // Net Cashflow in hand for the landlord (Collected Rent - Released Maintenance)
    const netOwnerCash = collectedRentTotal - maintenancePaidTotal;

    return {
      totalUnits: properties.length,
      occupiedCount: occupiedUnits.length,
      vacantCount: vacantUnits.length,
      expectedRentTotal,
      collectedRentTotal,
      rentCollectionPct,
      totalUtilitiesBilled,
      maintenancePaidTotal,
      pendingFundReleaseCount,
      pendingFundReleaseSum,
      netOwnerCash,
    };
  }, [properties, incidents]);

  // Building-by-Building Summary (Vue Immeuble A, Immeuble B, Maisons Isolées)
  const buildingSummaries = useMemo(() => {
    const scopes: Array<{ key: string; title: string; subtitle: string; units: PropertyUnit[] }> = [
      ...buildingGroups.map((g) => ({
        key: g,
        title: g,
        subtitle: 'Vue consolidée de l’immeuble',
        units: properties.filter((p) => p.groupName === g),
      })),
      {
        key: 'ISOLATED',
        title: 'Maisons & Biens Isolés',
        subtitle: 'Villas et pavillons hors immeuble',
        units: properties.filter((p) => p.groupName === null),
      },
    ];

    return scopes.map((sc) => {
      const occ = sc.units.filter((u) => u.occupied);
      const expectedRent = occ.reduce((s, u) => s + u.rentAmount, 0);
      const paidRent = occ
        .filter((u) => u.rentStatus === 'paye')
        .reduce((s, u) => s + u.rentAmount, 0);
      const pct = expectedRent > 0 ? Math.round((paidRent / expectedRent) * 100) : 0;

      const elecTotal = sc.units.reduce(
        (s, u) =>
          s +
          u.charges
            .filter((c) => c.category.toLowerCase().includes('élec'))
            .reduce((cs, c) => cs + c.amount, 0),
        0
      );

      const unitIds = new Set(sc.units.map((u) => u.id));
      const groupIncidents = incidents.filter((inc) => unitIds.has(inc.propertyId));
      const maintenanceCost = groupIncidents.reduce(
        (s, inc) => s + (inc.paidAmount || inc.invoiceAmount || inc.quoteAmount),
        0
      );

      return {
        ...sc,
        expectedRent,
        paidRent,
        pct,
        elecTotal,
        incidentCount: groupIncidents.length,
        maintenanceCost,
      };
    });
  }, [properties, incidents, buildingGroups]);

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return properties.filter((p) => {
      const matchesGroup =
        groupFilter === 'ALL' ||
        (groupFilter === 'ISOLATED' && p.groupName === null) ||
        (groupFilter === 'VACANT' && !p.occupied) ||
        p.groupName === groupFilter;

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tenantName.toLowerCase().includes(q) ||
        (p.groupName && p.groupName.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        (p.customCategoryLabel && p.customCategoryLabel.toLowerCase().includes(q));

      return matchesGroup && matchesSearch;
    });
  }, [properties, groupFilter, searchQuery]);

  // Helper to prepend a history ledger entry
  const addHistoryEntry = (entry: Omit<HistoryLedgerEntry, 'id' | 'date'>) => {
    const nowStr = '28 sept. 2026 · En direct';
    setHistory((prev) => [
      {
        ...entry,
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: nowStr,
      },
      ...prev,
    ]);
  };

  // Action: Toggle Occupied / Vacant
  const handleToggleOccupancy = (prop: PropertyUnit) => {
    const nextOccupied = !prop.occupied;
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== prop.id) return p;
        return {
          ...p,
          occupied: nextOccupied,
          tenantName: nextOccupied ? p.tenantName || 'Nouveau Locataire' : '',
          rentStatus: nextOccupied ? p.rentStatus : 'en_attente',
          agencyMandateActive: false,
        };
      })
    );

    addHistoryEntry({
      propertyId: prop.id,
      groupName: prop.groupName,
      type: 'occupation',
      title: nextOccupied
        ? `${prop.name} marqué comme Occupé`
        : `Sortie locataire — ${prop.name} marqué comme Vacant`,
      detail: nextOccupied
        ? 'Bail actif et suivi des loyers réactivé.'
        : autoSuggestions
        ? 'Bien vacant détecté : suggestion automatique d’agences de relocation activée.'
        : 'Bien vacant en attente de nouveau locataire.',
      direction: 'info',
    });

    triggerFeedback(
      nextOccupied
        ? `${prop.name} est désormais marqué Occupé.`
        : `${prop.name} est passé en statut Vacant.${
            autoSuggestions ? ' Une suggestion d’agence vous est proposée.' : ''
          }`
    );
  };

  // Action: Mandate Suggested Partner Agency for a Vacant Property
  const handleMandateAgency = (prop: PropertyUnit, agencyName: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === prop.id
          ? { ...p, agencyMandateActive: true, selectedAgencyName: agencyName }
          : p
      )
    );

    addHistoryEntry({
      propertyId: prop.id,
      groupName: prop.groupName,
      type: 'occupation',
      title: `Mandat de relocation confié à ${agencyName}`,
      detail: `Recherche active de locataire solvable pour ${prop.name} (${formatUsd(
        prop.rentAmount
      )}/mois).`,
      direction: 'info',
      channel: agencyName,
    });

    triggerFeedback(
      `Agence « ${agencyName} » mandatée pour relouer ${prop.name}.`
    );
  };

  // Action: Record Rent + Charges Payment (Mobile Money or Large Sum Bank Option)
  const handleRecordPayment = (propertyId: string, channel: PaymentChannel) => {
    const target = properties.find((p) => p.id === propertyId);
    if (!target) return;

    const chargesSum = target.charges
      .filter((c) => !c.paid)
      .reduce((s, c) => s + c.amount, 0);
    const totalPaid = target.rentAmount + chargesSum;
    const refPrefix = channel.includes('Orange')
      ? 'OM'
      : channel.includes('Wave')
      ? 'WV'
      : channel.includes('MTN')
      ? 'MTN'
      : channel.includes('Airtel')
      ? 'AM'
      : 'VIR';
    const paymentRef = `${refPrefix}-2609-${Math.floor(10000 + Math.random() * 89999)}`;

    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        return {
          ...p,
          rentStatus: 'paye',
          lastPaymentChannel: channel,
          lastPaymentRef: paymentRef,
          charges: p.charges.map((c) => ({ ...c, paid: true })),
        };
      })
    );

    addHistoryEntry({
      propertyId: target.id,
      groupName: target.groupName,
      type: 'loyer',
      title: `Loyer & Charges encaissés — ${target.name} (${formatUsd(totalPaid)})`,
      detail: `Statut actualisé automatiquement via ${channel} · Réf ${paymentRef}.`,
      amount: totalPaid,
      direction: 'entree',
      channel,
    });

    setPaymentModalProp(null);
    triggerFeedback(
      `Paiement reçu via ${channel} (${formatUsd(
        totalPaid
      )}) pour ${target.name}. Statut actualisé en « Payé ».`
    );
  };

  // Action: Create Incident (Inline from Property Card or Tenant Portal)
  const handleCreateIncident = (
    propertyId: string,
    category: string,
    title: string,
    message: string,
    quoteVal?: number
  ) => {
    const target = properties.find((p) => p.id === propertyId);
    if (!target) return;

    const nextTicket =
      Math.max(180, ...incidents.map((i) => i.ticketNumber)) + 1;
    const computedQuote =
      quoteVal && quoteVal > 0 ? quoteVal : autoSuggestions ? 45 : 0;

    const initialStage = computedQuote > 0 ? 'devis_recu' : 'signale';

    const newInc: IncidentItem = {
      id: `inc-${Date.now()}`,
      ticketNumber: nextTicket,
      propertyId: target.id,
      propertyName: target.name,
      groupName: target.groupName,
      category,
      title,
      tenantMessage: message.startsWith('«') ? message : `« ${message} »`,
      providerName: autoSuggestions
        ? 'Artisan Partenaire LOCANA (Devis gratuit automatique)'
        : 'Artisan à désigner',
      providerPhone: '+243 81 229 40 10',
      quoteAmount: computedQuote || 50,
      approvedAmount: null,
      invoiceAmount: null,
      paidAmount: null,
      stage: initialStage,
      createdAt: '28 sept. 2026 · En direct',
      updatedAt: '28 sept. 2026 · En direct',
    };

    setIncidents((prev) => [newInc, ...prev]);

    addHistoryEntry({
      propertyId: target.id,
      groupName: target.groupName,
      type: 'incident',
      title: `Incident #${nextTicket} créé — ${title} (${target.name})`,
      detail: autoSuggestions
        ? `Signalement enregistré + Devis gratuit proposé (${formatUsd(
            newInc.quoteAmount
          )}) en attente de votre validation.`
        : `Signalement enregistré : ${message}`,
      amount: newInc.quoteAmount,
      direction: 'info',
    });

    setInlineIncidentPropId(null);
    setInlineIncTitle('');
    setInlineIncMessage('');
    setInlineIncCustomCat('');

    triggerFeedback(
      `Incident #${nextTicket} (${title}) ajouté sur ${target.name}.${
        autoSuggestions
          ? ` Un devis gratuit de ${formatUsd(newInc.quoteAmount)} vous est proposé.`
          : ''
      }`
    );
  };

  // Action: Advance Incident Pipeline (Devis -> Validé -> Facturé -> Libération des fonds)
  const handleApproveIncidentQuote = (inc: IncidentItem) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === inc.id
          ? {
              ...item,
              stage: 'valide',
              approvedAmount: item.quoteAmount,
              updatedAt: '28 sept. 2026 · Devis validé',
            }
          : item
      )
    );

    addHistoryEntry({
      propertyId: inc.propertyId,
      groupName: inc.groupName,
      type: 'incident',
      title: `Devis validé (${formatUsd(inc.quoteAmount)}) — Incident #${
        inc.ticketNumber
      }`,
      detail: `Vous avez autorisé l’intervention de ${inc.providerName} sur ${inc.propertyName}.`,
      amount: inc.quoteAmount,
      direction: 'info',
    });

    triggerFeedback(
      `Devis de ${formatUsd(inc.quoteAmount)} accepté pour l’Incident #${
        inc.ticketNumber
      }. L’artisan démarre l’intervention.`
    );
  };

  const handleReceiveInterventionInvoice = (
    inc: IncidentItem,
    finalInvoiceUsd: number
  ) => {
    // If autoReleaseFunds is enabled by the landlord, immediately release funds!
    // Otherwise, stop at stage 'facture' so the landlord explicitly validates before funds leave.
    const nextStage = autoReleaseFunds ? 'paye' : 'facture';

    setIncidents((prev) =>
      prev.map((item) =>
        item.id === inc.id
          ? {
              ...item,
              stage: nextStage,
              invoiceAmount: finalInvoiceUsd,
              paidAmount: autoReleaseFunds ? finalInvoiceUsd : null,
              updatedAt: autoReleaseFunds
                ? '28 sept. 2026 · Payé automatiquement'
                : '28 sept. 2026 · Facture reçue (Attente déblocage)',
            }
          : item
      )
    );

    addHistoryEntry({
      propertyId: inc.propertyId,
      groupName: inc.groupName,
      type: 'incident',
      title: autoReleaseFunds
        ? `Facture réglée automatiquement (${formatUsd(
            finalInvoiceUsd
          )}) — Incident #${inc.ticketNumber}`
        : `Facture finale reçue (${formatUsd(
            finalInvoiceUsd
          )}) — En attente de votre déblocage`,
      detail: `Devis initial : ${formatUsd(
        inc.quoteAmount
      )} → Validé : ${formatUsd(
        inc.approvedAmount || inc.quoteAmount
      )} → Facture finale : ${formatUsd(finalInvoiceUsd)}.`,
      amount: finalInvoiceUsd,
      direction: autoReleaseFunds ? 'sortie' : 'info',
      channel: inc.providerName,
    });

    triggerFeedback(
      autoReleaseFunds
        ? `Facture de ${formatUsd(
            finalInvoiceUsd
          )} reçue et réglée automatiquement (mode automatique actif).`
        : `Facture finale de ${formatUsd(
            finalInvoiceUsd
          )} reçue pour l’Incident #${
            inc.ticketNumber
          }. Cliquez sur « Libérer le paiement » pour débloquer les fonds.`
    );
  };

  const handleReleaseIncidentFunds = (inc: IncidentItem) => {
    const amountToPay = inc.invoiceAmount || inc.approvedAmount || inc.quoteAmount;

    setIncidents((prev) =>
      prev.map((item) =>
        item.id === inc.id
          ? {
              ...item,
              stage: 'paye',
              paidAmount: amountToPay,
              updatedAt: '28 sept. 2026 · Fonds libérés par le propriétaire',
            }
          : item
      )
    );

    addHistoryEntry({
      propertyId: inc.propertyId,
      groupName: inc.groupName,
      type: 'incident',
      title: `Paiement libéré (${formatUsd(amountToPay)}) — Incident #${
        inc.ticketNumber
      } (${inc.title})`,
      detail: `Traçabilité complète : Devis ${formatUsd(
        inc.quoteAmount
      )} → Validé ${formatUsd(
        inc.approvedAmount || inc.quoteAmount
      )} → Facture ${formatUsd(amountToPay)} → Payé ${formatUsd(amountToPay)}.`,
      amount: amountToPay,
      direction: 'sortie',
      channel: inc.providerName,
    });

    triggerFeedback(
      `Fonds libérés (${formatUsd(amountToPay)}) pour l’Incident #${
        inc.ticketNumber
      }. Traçabilité complète enregistrée dans l’historique.`
    );
  };

  // Action: Apply Utility Bill Split across buildings or units
  const handleApplyUtilitySplit = (
    billLabel: string,
    periodLabel: string,
    allocations: Array<{
      propertyId: string;
      amount: number;
      consumptionUnits: string;
    }>
  ) => {
    const allocMap = new Map(allocations.map((a) => [a.propertyId, a]));

    setProperties((prev) =>
      prev.map((p) => {
        const match = allocMap.get(p.id);
        if (!match) return p;

        const existingIdx = p.charges.findIndex(
          (c) => c.category.toLowerCase() === billLabel.toLowerCase()
        );

        const newChargeItem = {
          id: `chg-${p.id}-${Date.now()}`,
          category: billLabel,
          amount: match.amount,
          consumptionUnits: match.consumptionUnits,
          periodLabel,
          paid: false,
        };

        const updatedCharges =
          existingIdx >= 0
            ? p.charges.map((c, idx) => (idx === existingIdx ? newChargeItem : c))
            : [...p.charges, newChargeItem];

        return {
          ...p,
          charges: updatedCharges,
        };
      })
    );

    const totalSplit = allocations.reduce((s, a) => s + a.amount, 0);
    allocations.forEach((a) => {
      const targetProp = properties.find((p) => p.id === a.propertyId);
      if (targetProp) {
        addHistoryEntry({
          propertyId: targetProp.id,
          groupName: targetProp.groupName,
          type: 'charge',
          title: `Quote-part « ${billLabel} » calculée : ${formatUsd(a.amount)}`,
          detail: `Période : ${periodLabel} · Base : ${a.consumptionUnits}.`,
          amount: a.amount,
          direction: 'info',
        });
      }
    });

    triggerFeedback(
      `Facture « ${billLabel} » (${formatUsd(
        totalSplit
      )}) répartie automatiquement sur ${allocations.length} biens.`
    );
    setActiveTab('patrimoine');
  };

  // Action: Add single custom charge directly on a property card
  const handleAddSingleCharge = (propertyId: string) => {
    const amountNum = Number(inlineChargeAmount);
    if (Number.isNaN(amountNum) || amountNum <= 0) return;

    const finalLabel =
      inlineChargePreset === 'Autre'
        ? inlineChargeCustomLabel.trim() || 'Charge diverse'
        : inlineChargePreset;

    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        return {
          ...p,
          charges: [
            ...p.charges,
            {
              id: `chg-single-${Date.now()}`,
              category: finalLabel,
              amount: amountNum,
              consumptionUnits: 'Imputation directe',
              periodLabel: 'Septembre 2026',
              paid: false,
            },
          ],
        };
      })
    );

    const target = properties.find((p) => p.id === propertyId);
    if (target) {
      addHistoryEntry({
        propertyId: target.id,
        groupName: target.groupName,
        type: 'charge',
        title: `Facture « ${finalLabel} » ajoutée (${formatUsd(amountNum)})`,
        detail: `Imputée sur ${target.name}.`,
        amount: amountNum,
        direction: 'info',
      });
    }

    setInlineChargePropId(null);
    setInlineChargeCustomLabel('');
    triggerFeedback(
      `Facture « ${finalLabel} » (${formatUsd(amountNum)}) ajoutée au bien.`
    );
  };

  // Action: Update Meter Weights
  const handleUpdateMeterWeight = (
    propertyId: string,
    kwh: number,
    m3: number
  ) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? { ...p, meterWeightKwh: kwh, waterWeightM3: m3 }
          : p
      )
    );
  };

  // Action: Add a New Property (Appartement, Maison isolée, Chambre, ou Autre personnalisé)
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    setAddPropError('');

    const rentNum = Number(newPropRent);
    if (!newPropName.trim() || Number.isNaN(rentNum) || rentNum <= 0) {
      setAddPropError(
        'Veuillez renseigner le nom du bien (ex: Appartement 14 ou Maison Lot 8) et un loyer valide.'
      );
      return;
    }

    if (newPropCategory === 'Autre' && !newPropCustomCategory.trim()) {
      setAddPropError('Veuillez préciser le type de bien personnalisé.');
      return;
    }

    const resolvedGroup =
      newPropGroupMode === 'isolated'
        ? null
        : newPropGroupMode === 'custom'
        ? newPropCustomGroup.trim() || 'Immeuble C'
        : newPropGroupName;

    const created: PropertyUnit = {
      id: `prop-${Date.now()}`,
      name: newPropName.trim(),
      category: newPropCategory,
      customCategoryLabel:
        newPropCategory === 'Autre' ? newPropCustomCategory.trim() : undefined,
      groupName: resolvedGroup,
      occupied: newPropOccupied,
      tenantName: newPropOccupied
        ? newPropTenant.trim() || 'Locataire en place'
        : '',
      tenantPhone: newPropOccupied ? newPropPhone.trim() || '+243 81 000 00 00' : '',
      leaseStart: newPropOccupied ? '28 sept. 2026' : 'Vacant',
      rentAmount: rentNum,
      rentStatus: 'en_attente',
      meterWeightKwh: 110,
      waterWeightM3: 7,
      charges: [
        {
          id: `chg-init-${Date.now()}`,
          category: 'Électricité',
          amount: 32,
          consumptionUnits: '110 kWh',
          periodLabel: 'Septembre 2026',
          paid: false,
        },
      ],
    };

    setProperties((prev) => [created, ...prev]);

    addHistoryEntry({
      propertyId: created.id,
      groupName: created.groupName,
      type: 'occupation',
      title: `Nouveau bien enregistré : ${created.name}`,
      detail: `Type : ${
        created.category === 'Autre'
          ? created.customCategoryLabel
          : created.category
      } · Rattachement : ${
        created.groupName || 'Maison / Bien isolé hors immeuble'
      } · Loyer : ${formatUsd(created.rentAmount)}.`,
      amount: created.rentAmount,
      direction: 'info',
    });

    setIsAddPropOpen(false);
    setNewPropName('');
    setNewPropTenant('');
    setNewPropCustomCategory('');
    triggerFeedback(
      `Bien « ${created.name} » (${
        created.groupName || 'Bien isolé'
      }) ajouté à votre patrimoine.`
    );
  };

  // Export Full Ledger CSV
  const handleExportLedgerCsv = () => {
    const headers = [
      'Bien',
      'Type',
      'Groupe_Immeuble',
      'Occupation',
      'Locataire',
      'Loyer_USD',
      'Statut_Loyer',
      'Charges_USD',
      'Canal_Paiement',
    ];
    const rows = properties.map((p) => [
      `"${p.name}"`,
      `"${p.category === 'Autre' ? p.customCategoryLabel : p.category}"`,
      `"${p.groupName || 'Maison isolee'}"`,
      p.occupied ? 'Occupe' : 'Vacant',
      `"${p.tenantName || '-'}"`,
      p.rentAmount,
      p.rentStatus,
      p.charges.reduce((s, c) => s + c.amount, 0),
      `"${p.lastPaymentChannel || '-'}"`,
    ]);
    const csv =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', 'locana_patrimoine_complet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback('Registre complet LOCANA exporté au format CSV (Excel).');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#patrimoine"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('patrimoine');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          LOCANA
        </a>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Navigation LOCANA"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => setActiveTab('patrimoine')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'patrimoine'
                ? 'text-slate-900 border-[#1E40AF] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Biens & Immeubles ({properties.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('repartition')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'repartition'
                ? 'text-slate-900 border-[#1E40AF] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Répartition Factures (Élec / Eau / Autre)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'incidents'
                ? 'text-slate-900 border-[#1E40AF] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Incidents & Fonds ({incidents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historique')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'historique'
                ? 'text-slate-900 border-[#1E40AF] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Historique 360°
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('locataire')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'locataire'
                ? 'text-[#1E40AF] border-[#1E40AF] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Connexion Locataire (ID / Tél)
          </button>
        </nav>

        {/* Zone 3: Primary CTA Action */}
        <div className="flex items-center gap-2.5">
          {activeTab === 'locataire' ? (
            <button
              type="button"
              onClick={() => setActiveTab('patrimoine')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>← Retour Vue Propriétaire</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleExportLedgerCsv}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddPropOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1E40AF] rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un bien</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* WORKSPACE CANVAS: SIDEBAR + MAIN VIEWPORT */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar: OS Control Panel & Automation Switches (Hidden when in Isolated Tenant View) */}
        {!(activeTab === 'locataire' && isIsolatedTenantMode) && (
        <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-5 select-none">
          <div className="space-y-6">
            {/* OS Identity Summary */}
            <div className="pb-4 border-b border-slate-200">
              <div className="text-xs font-semibold text-[#1E40AF]">
                OS de Gestion Immobilière
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                Portefeuille Propriétaire Asher
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Biens → Personnes → Argent → Incidents → Fournisseurs → Consommations.
              </p>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 px-2.5 pb-1">
                Vues du Système
              </div>
              {(
                [
                  {
                    id: 'patrimoine',
                    label: 'Vue Immeubles & Maisons',
                    sub: `${properties.length} lots`,
                  },
                  {
                    id: 'repartition',
                    label: 'Calculateur Élec / Eau / Autre',
                    sub: 'Auto',
                  },
                  {
                    id: 'incidents',
                    label: 'Incidents & Déblocage Fonds',
                    sub:
                      globalStats.pendingFundReleaseCount > 0
                        ? `${globalStats.pendingFundReleaseCount} à valider`
                        : 'À jour',
                  },
                  {
                    id: 'historique',
                    label: 'Traçabilité & Historique 360°',
                    sub: `${history.length} actes`,
                  },
                  {
                    id: 'locataire',
                    label: 'Vue Côté Locataire (Live)',
                    sub: 'Interactif',
                  },
                ] as const
              ).map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span
                      className={`font-mono-tabular text-[11px] ${
                        active ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Règles d'Automatisation & Contrôle des Fonds */}
            <div className="pt-5 border-t border-slate-200 space-y-4">
              <div className="text-xs font-semibold text-slate-900">
                Contrôle Propriétaire & Automatisation
              </div>

              {/* Switch 1: Validation avant libération des fonds */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Libération auto. des factures
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoReleaseFunds}
                    onClick={() => {
                      const next = !autoReleaseFunds;
                      setAutoReleaseFunds(next);
                      triggerFeedback(
                        next
                          ? 'Mode automatique activé : les factures d’incidents validés seront payées automatiquement.'
                          : 'Mode contrôle strict activé : aucune facture n’est payée sans votre clic sur « Libérer le paiement ».'
                      );
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      autoReleaseFunds ? 'bg-[#1E40AF]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        autoReleaseFunds ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {autoReleaseFunds
                    ? 'Actif : les factures finales d’artisans sont réglées dès réception.'
                    : 'Désactivé (Recommandé) : vous recevez votre argent et validez vous-même chaque facture avant que les fonds ne soient libérés.'}
                </p>
              </div>

              {/* Switch 2: Suggestions automatiques (Agences si bien vacant + Devis gratuits) */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Suggestions Agences & Devis
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoSuggestions}
                    onClick={() => {
                      const next = !autoSuggestions;
                      setAutoSuggestions(next);
                      triggerFeedback(
                        next
                          ? 'Suggestions automatiques activées (Agences en cas de vacance & devis gratuits artisans).'
                          : 'Suggestions automatiques désactivées.'
                      );
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      autoSuggestions ? 'bg-[#1E40AF]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        autoSuggestions ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {autoSuggestions
                    ? 'Actif : dès qu’un bien est vacant, LOCANA suggère une agence ; dès qu’un incident arrive, un devis gratuit est proposé.'
                    : 'Désactivé : aucune suggestion d’agence ou d’artisan partenaire ne s’affiche.'}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Profile Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
            <ResilientImage
              src={ASSETS.avatarLeadFinance}
              alt="Propriétaire"
              fallbackType="avatar"
              initials="AS"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-semibold text-slate-900 truncate">
                Propriétaire · Compte Principal
              </div>
              <div className="text-slate-500 truncate">
                Mobile Money & Banque connectés
              </div>
            </div>
          </div>
        </aside>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-5 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6">
          {/* Mobile Navigation Bar */}
          <div className="flex md:hidden items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
            {(
              [
                { id: 'patrimoine', label: 'Biens & Immeubles' },
                { id: 'repartition', label: 'Factures Élec/Eau' },
                { id: 'incidents', label: 'Incidents & Fonds' },
                { id: 'historique', label: 'Historique' },
                { id: 'locataire', label: 'Vue Locataire' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Live Feedback Toast Banner */}
          {feedbackNotice && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-900 text-white text-xs">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedbackNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackNotice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Global KPI Strip: « Où est passé mon argent ? » (Hidden in Isolated Tenant View) */}
          {!(activeTab === 'locataire' && isIsolatedTenantMode) && (
          <section
            aria-label="Synthèse financière du patrimoine"
            className="border border-slate-200 bg-white rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
          >
            <div className="p-5">
              <div className="text-xs text-slate-500">
                Loyers Encaissés / Attendus ({globalStats.rentCollectionPct} %)
              </div>
              <div className="text-2xl font-semibold font-mono-tabular text-slate-900 mt-1">
                {formatUsd(globalStats.collectedRentTotal)}{' '}
                <span className="text-sm font-normal text-slate-400">
                  / {formatUsd(globalStats.expectedRentTotal)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${globalStats.rentCollectionPct}%` }}
                />
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs text-slate-500">
                Occupation & Vacance Locative
              </div>
              <div className="text-2xl font-semibold font-mono-tabular text-slate-900 mt-1">
                {globalStats.occupiedCount} occupés{' '}
                <span className="text-sm font-normal text-amber-700">
                  · {globalStats.vacantCount} vacant(s)
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1.5">
                Immeubles ET maisons individuelles inclus
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs text-slate-500">
                Maintenance & Fonds à Débloquer
              </div>
              <div className="text-2xl font-semibold font-mono-tabular text-slate-900 mt-1">
                {formatUsd(globalStats.maintenancePaidTotal)} réglés
              </div>
              <div className="text-xs mt-1.5">
                {globalStats.pendingFundReleaseCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('incidents')}
                    className="text-amber-700 font-semibold hover:underline cursor-pointer"
                  >
                    {globalStats.pendingFundReleaseCount} facture(s) ({formatUsd(
                      globalStats.pendingFundReleaseSum
                    )}) en attente de votre validation →
                  </button>
                ) : (
                  <span className="text-emerald-700 font-medium">
                    Aucune facture en attente de déblocage
                  </span>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs text-slate-500">
                Trésorerie Nette Propriétaire (Traçable)
              </div>
              <div className="text-2xl font-semibold font-mono-tabular text-[#1E40AF] mt-1">
                {formatUsd(globalStats.netOwnerCash)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 font-mono-tabular">
                Charges réparties ce mois : {formatUsd(globalStats.totalUtilitiesBilled)}
              </div>
            </div>
          </section>
          )}

          {/* =========================================================
              TAB 1: PATRIMOINE (VUE IMMEUBLE + MAISONS ISOLÉES + BIENS)
             ========================================================= */}
          {activeTab === 'patrimoine' && (
            <div className="space-y-6">
              {/* Consolidated Building & Isolated Houses Cards (Vue Immeuble A / Maisons) */}
              <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      01. Vue Consolidée par Immeuble & Maisons Individuelles
                    </h2>
                    <p className="text-xs text-slate-500">
                      Cliquez sur un ensemble pour filtrer ses biens ou répartir une facture collective
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('repartition')}
                    className="text-xs font-medium text-[#1E40AF] hover:underline inline-flex items-center gap-1 cursor-pointer self-start"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Répartir une facture Électricité / Eau / Autre</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {buildingSummaries.map((b) => {
                    const isSelected = groupFilter === b.key;
                    return (
                      <div
                        key={b.key}
                        onClick={() =>
                          setGroupFilter(isSelected ? 'ALL' : b.key)
                        }
                        className={`border rounded-lg p-5 bg-white transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#1E40AF] ring-1 ring-[#1E40AF]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              {b.key === 'ISOLATED' ? (
                                <Home className="w-3.5 h-3.5 text-slate-700" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-[#1E40AF]" />
                              )}
                              <span>{b.subtitle}</span>
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                              {b.title}
                            </h3>
                          </div>
                          <span className="text-xs font-mono-tabular text-slate-500">
                            {b.units.length} bien(s)
                          </span>
                        </div>

                        {/* Progress Bar Loyers */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Loyers encaissés</span>
                            <span className="font-mono-tabular font-semibold text-slate-900">
                              {b.pct} % ({formatUsd(b.paidRent)} / {formatUsd(b.expectedRent)})
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1E40AF]"
                              style={{ width: `${b.pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 block">Électricité répartie</span>
                            <span className="font-mono-tabular font-semibold text-slate-900">
                              {formatUsd(b.elecTotal)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">
                              Maintenance ({b.incidentCount} inc.)
                            </span>
                            <span className="font-mono-tabular font-semibold text-slate-900">
                              {formatUsd(b.maintenanceCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Filter Bar & Search for Individual Properties */}
              <section className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGroupFilter('ALL')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        groupFilter === 'ALL'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tous les biens ({properties.length})
                    </button>
                    {buildingGroups.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGroupFilter(g)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          groupFilter === g
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setGroupFilter('ISOLATED')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        groupFilter === 'ISOLATED'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Maisons isolées (Hors immeuble)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupFilter('VACANT')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        groupFilter === 'VACANT'
                          ? 'bg-amber-700 text-white border-amber-700'
                          : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      Biens Vacants ({globalStats.vacantCount})
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Chercher Appartement 12, Villa, locataire..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 w-full sm:w-64 focus:outline-none focus:border-[#1E40AF]"
                    />
                  </div>
                </div>

                {/* Detailed Property Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {filteredProperties.map((prop) => {
                    const propIncidents = incidents.filter(
                      (i) => i.propertyId === prop.id
                    );
                    const isAddingIncidentHere = inlineIncidentPropId === prop.id;
                    const isAddingChargeHere = inlineChargePropId === prop.id;

                    return (
                      <article
                        key={prop.id}
                        className="border border-slate-200 bg-white rounded-lg p-5 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-4">
                          {/* Card Header: Name, Category, Building/Isolated, and Occupancy Switch */}
                          <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-slate-200">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono-tabular font-semibold text-[#1E40AF]">
                                  ID: {prop.id}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-medium text-slate-700">
                                  {prop.category === 'Autre'
                                    ? prop.customCategoryLabel
                                    : prop.category}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  {prop.groupName
                                    ? prop.groupName
                                    : 'Maison isolée (Hors immeuble)'}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                                {prop.name}
                              </h3>
                              {prop.occupied ? (
                                <p className="text-xs text-slate-600 mt-0.5">
                                  Locataire :{' '}
                                  <span className="font-medium text-slate-900">
                                    {prop.tenantName}
                                  </span>{' '}
                                  ({prop.tenantPhone})
                                </p>
                              ) : (
                                <p className="text-xs font-semibold text-amber-700 mt-0.5">
                                  Logement actuellement Vacant (Vide)
                                </p>
                              )}
                            </div>

                            {/* Direct Occupancy Toggle Button */}
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleOccupancy(prop)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  prop.occupied
                                    ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                }`}
                                title="Cliquer pour basculer entre Occupé et Vacant"
                              >
                                {prop.occupied ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Occupé (Passer Vacant)</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Vacant (Marquer Occupé)</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* VACANCY + AUTOMATIC AGENCY SUGGESTION (When Vacant & Toggle Active) */}
                          {!prop.occupied && autoSuggestions && (
                            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-2.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                  <span>
                                    Bien vacant détecté — Voulez-vous mandater une agence partenaire ?
                                  </span>
                                </span>
                              </div>
                              {prop.agencyMandateActive ? (
                                <div className="text-emerald-800 font-medium">
                                  ✓ Mandat transmis à « {prop.selectedAgencyName} ». Visites candidats en cours.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-amber-800/90">
                                    LOCANA vous suggère ces agences vérifiées pour relouer {prop.name} ({formatUsd(prop.rentAmount)}/mois) :
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {PARTNER_AGENCIES.slice(0, 2).map((ag) => (
                                      <div
                                        key={ag.id}
                                        className="p-2.5 bg-white rounded border border-amber-200 flex flex-col justify-between gap-2"
                                      >
                                        <div>
                                          <div className="font-semibold text-slate-900">
                                            {ag.name}
                                          </div>
                                          <div className="text-[11px] text-slate-500">
                                            Délai moyen : {ag.avgPlacementDays} jours · {ag.feeStructure}
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleMandateAgency(prop, ag.name)
                                          }
                                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer self-start"
                                        >
                                          Confier la relocation
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Financial & Utilities Breakdown (Loyer + Électricité + Eau + Autres) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                            <div>
                              <span className="text-slate-500 block">Loyer mensuel</span>
                              <span className="font-mono-tabular text-sm font-semibold text-slate-900 mt-0.5 block">
                                {formatUsd(prop.rentAmount)}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-500 block">Statut Loyer</span>
                              {prop.occupied ? (
                                prop.rentStatus === 'paye' ? (
                                  <span className="font-semibold text-emerald-700 mt-0.5 block">
                                    Payé ({prop.lastPaymentChannel || 'Mobile Money'})
                                  </span>
                                ) : (
                                  <span className="font-semibold text-amber-700 mt-0.5 block">
                                    En attente
                                  </span>
                                )
                              ) : (
                                <span className="text-slate-400 mt-0.5 block">
                                  Inoccupé
                                </span>
                              )}
                            </div>

                            <div className="col-span-2">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">
                                  Charges & Consommations ({prop.charges.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setInlineChargePropId(
                                      isAddingChargeHere ? null : prop.id
                                    )
                                  }
                                  className="text-[11px] font-medium text-[#1E40AF] hover:underline cursor-pointer"
                                >
                                  + Ajouter charge / Autre
                                </button>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                {prop.charges.map((c) => (
                                  <span
                                    key={c.id}
                                    className="font-mono-tabular text-slate-800"
                                  >
                                    {c.category} :{' '}
                                    <strong className="font-semibold">
                                      {formatUsd(c.amount)}
                                    </strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Inline Add Custom Charge Form ("Eau / Électricité / Autre") */}
                          {isAddingChargeHere && (
                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 space-y-3 text-xs">
                              <div className="flex items-center justify-between font-semibold text-slate-900">
                                <span>Imputer une facture sur {prop.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setInlineChargePropId(null)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  'Électricité',
                                  'Eau',
                                  'Internet',
                                  'Gardiennage',
                                  'Autre',
                                ].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setInlineChargePreset(preset)}
                                    className={`px-2.5 py-1 rounded border text-xs cursor-pointer ${
                                      inlineChargePreset === preset
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {preset === 'Autre'
                                      ? 'Autre (Écrire soi-même)'
                                      : preset}
                                  </button>
                                ))}
                              </div>
                              {inlineChargePreset === 'Autre' && (
                                <input
                                  type="text"
                                  value={inlineChargeCustomLabel}
                                  onChange={(e) =>
                                    setInlineChargeCustomLabel(e.target.value)
                                  }
                                  placeholder="Écrivez le nom de la charge (ex: Vidange, Groupe électrogène...)"
                                  className="w-full px-3 py-1.5 bg-white border border-[#1E40AF] rounded"
                                />
                              )}
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  value={inlineChargeAmount}
                                  onChange={(e) =>
                                    setInlineChargeAmount(e.target.value)
                                  }
                                  className="w-28 px-3 py-1.5 font-mono-tabular bg-white border border-slate-200 rounded"
                                  placeholder="Montant $"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddSingleCharge(prop.id)}
                                  className="px-3 py-1.5 font-medium text-white bg-[#1E40AF] rounded hover:bg-blue-800 cursor-pointer"
                                >
                                  Enregistrer la charge
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Incidents List on this Property */}
                          {propIncidents.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-slate-700">
                                Incidents techniques & Traçabilité des coûts :
                              </div>
                              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                {propIncidents.map((inc) => (
                                  <div
                                    key={inc.id}
                                    className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div>
                                      <div className="font-semibold text-slate-900">
                                        Incident #{inc.ticketNumber} · {inc.title}{' '}
                                        <span className="font-normal text-slate-500">
                                          ({inc.category})
                                        </span>
                                      </div>
                                      <div className="font-mono-tabular text-[11px] text-slate-600 mt-0.5">
                                        Devis : {formatUsd(inc.quoteAmount)}
                                        {inc.approvedAmount
                                          ? ` → Validé : ${formatUsd(inc.approvedAmount)}`
                                          : ''}
                                        {inc.invoiceAmount
                                          ? ` → Facture : ${formatUsd(inc.invoiceAmount)}`
                                          : ''}
                                        {inc.paidAmount
                                          ? ` → Payé : ${formatUsd(inc.paidAmount)}`
                                          : ''}
                                      </div>
                                    </div>

                                    <div className="shrink-0">
                                      {inc.stage === 'devis_recu' && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleApproveIncidentQuote(inc)
                                          }
                                          className="px-2.5 py-1 text-xs font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded cursor-pointer"
                                        >
                                          Accepter devis ({formatUsd(inc.quoteAmount)})
                                        </button>
                                      )}
                                      {inc.stage === 'valide' && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleReceiveInterventionInvoice(
                                              inc,
                                              Math.max(10, inc.quoteAmount - 5)
                                            )
                                          }
                                          className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                                        >
                                          Simuler réception facture ({formatUsd(
                                            Math.max(10, inc.quoteAmount - 5)
                                          )})
                                        </button>
                                      )}
                                      {inc.stage === 'facture' && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleReleaseIncidentFunds(inc)
                                          }
                                          className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                                        >
                                          Libérer le paiement ({formatUsd(
                                            inc.invoiceAmount || inc.quoteAmount
                                          )})
                                        </button>
                                      )}
                                      {inc.stage === 'paye' && (
                                        <span className="text-emerald-700 font-semibold">
                                          ✓ Payé & Traçable
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* INLINE "+ INCIDENT" FORM (Replaces broken browser prompt!) */}
                          {isAddingIncidentHere && (
                            <div className="p-4 rounded-lg bg-slate-50 border border-[#1E40AF] space-y-3 text-xs">
                              <div className="flex items-center justify-between font-semibold text-slate-900">
                                <span>
                                  Nouvel incident technique sur {prop.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setInlineIncidentPropId(null)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  'Plomberie',
                                  'Électricité',
                                  'Climatisation',
                                  'Toiture',
                                  'Autre',
                                ].map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setInlineIncCategory(cat)}
                                    className={`px-2.5 py-1 rounded border cursor-pointer ${
                                      inlineIncCategory === cat
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {cat === 'Autre'
                                      ? 'Autre (Écrire soi-même)'
                                      : cat}
                                  </button>
                                ))}
                              </div>

                              {inlineIncCategory === 'Autre' && (
                                <input
                                  type="text"
                                  value={inlineIncCustomCat}
                                  onChange={(e) =>
                                    setInlineIncCustomCat(e.target.value)
                                  }
                                  placeholder="Précisez la catégorie (ex: Portail, Serrure, Peinture...)"
                                  className="w-full px-3 py-1.5 bg-white border border-[#1E40AF] rounded"
                                />
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={inlineIncTitle}
                                  onChange={(e) =>
                                    setInlineIncTitle(e.target.value)
                                  }
                                  placeholder="Problème (ex: Fuite robinet cuisine)"
                                  className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded"
                                />
                                <input
                                  type="number"
                                  min={0}
                                  value={inlineIncQuote}
                                  onChange={(e) =>
                                    setInlineIncQuote(e.target.value)
                                  }
                                  placeholder="Devis estimé $"
                                  className="px-3 py-1.5 font-mono-tabular bg-white border border-slate-200 rounded"
                                />
                              </div>

                              <input
                                type="text"
                                value={inlineIncMessage}
                                onChange={(e) =>
                                  setInlineIncMessage(e.target.value)
                                }
                                placeholder="Détail ou message du locataire (ex: La fuite vient de la cuisine)"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                              />

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setInlineIncidentPropId(null)}
                                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const finalCat =
                                      inlineIncCategory === 'Autre'
                                        ? inlineIncCustomCat.trim() || 'Autre'
                                        : inlineIncCategory;
                                    handleCreateIncident(
                                      prop.id,
                                      finalCat,
                                      inlineIncTitle.trim() ||
                                        'Intervention technique',
                                      inlineIncMessage.trim() ||
                                        'Signalement enregistré sur le bien.',
                                      Number(inlineIncQuote) || 45
                                    );
                                  }}
                                  className="px-3.5 py-1.5 font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded cursor-pointer"
                                >
                                  Créer l’incident & générer le devis
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setInlineIncidentPropId(
                                  isAddingIncidentHere ? null : prop.id
                                )
                              }
                              className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5 text-slate-600" />
                              <span>+ Incident</span>
                            </button>

                            {prop.occupied && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentModalProp(prop);
                                  setSelectedChannel(
                                    prop.rentAmount >= 500
                                      ? 'Virement Bancaire (Grandes sommes)'
                                      : 'Orange Money'
                                  );
                                }}
                                className="px-3 py-1.5 font-medium text-[#1E40AF] bg-blue-50 hover:bg-blue-100 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>
                                  {prop.rentStatus === 'paye'
                                    ? 'Paiement Mobile Money / Virement'
                                    : 'Encaisser Mobile Money / Virement'}
                                </span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHistoryScope(prop.id);
                              setActiveTab('historique');
                            }}
                            className="text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Historique complet</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* =========================================================
              TAB 2: RÉPARTITION AUTOMATIQUE DES FACTURES (ÉLEC / EAU / AUTRE)
             ========================================================= */}
          {activeTab === 'repartition' && (
            <UtilitySplitterSection
              properties={properties}
              groups={buildingGroups}
              onApplySplit={handleApplyUtilitySplit}
              onUpdateMeterWeight={handleUpdateMeterWeight}
            />
          )}

          {/* =========================================================
              TAB 3: INCIDENTS TECHNIQUES & LIBÉRATION DES FONDS
             ========================================================= */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <section className="border border-slate-200 bg-white rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <div className="text-xs font-semibold text-[#1E40AF] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Contrôle des Dépenses & Validation avant Déblocage des Fonds
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mt-1">
                      Suivi des Incidents : Diagnostic → Devis → Validation → Facture → Paiement
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chaque dépense est intégralement justifiée. Les fonds ne quittent jamais votre compte sans votre validation explicite (ou l’activation du mode automatique).
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start">
                    <button
                      type="button"
                      onClick={() => setAutoReleaseFunds((v) => !v)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        autoReleaseFunds
                          ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {autoReleaseFunds
                        ? 'Déblocage Automatique : ACTIVÉ'
                        : 'Déblocage Manuel par le Propriétaire : ACTIVÉ'}
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-200 pt-2">
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono-tabular font-semibold text-slate-900">
                            Incident #{inc.ticketNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#1E40AF]">
                            {inc.propertyName}
                          </span>
                          <span className="text-slate-500">
                            ({inc.groupName || 'Maison isolée'})
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 font-medium">
                            {inc.category}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900">
                          {inc.title}
                        </h3>
                        <p className="text-xs text-slate-600">{inc.tenantMessage}</p>
                        <div className="text-[11px] text-slate-500">
                          Prestataire :{' '}
                          <strong className="text-slate-700">
                            {inc.providerName}
                          </strong>{' '}
                          ({inc.providerPhone}) · Mis à jour : {inc.updatedAt}
                        </div>
                      </div>

                      {/* 4-Step Financial Traceability Chain */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono-tabular min-w-[300px]">
                          <div>
                            <span className="text-[10px] text-slate-400 font-sans block">
                              1. Devis
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatUsd(inc.quoteAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-sans block">
                              2. Validé
                            </span>
                            <span className="font-semibold text-slate-900">
                              {inc.approvedAmount
                                ? formatUsd(inc.approvedAmount)
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-sans block">
                              3. Facture
                            </span>
                            <span className="font-semibold text-slate-900">
                              {inc.invoiceAmount
                                ? formatUsd(inc.invoiceAmount)
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-sans block">
                              4. Payé
                            </span>
                            <span
                              className={`font-semibold ${
                                inc.paidAmount
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {inc.paidAmount ? formatUsd(inc.paidAmount) : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Stage Action Button */}
                        <div className="min-w-[190px] flex justify-end">
                          {inc.stage === 'devis_recu' && (
                            <button
                              type="button"
                              onClick={() => handleApproveIncidentQuote(inc)}
                              className="w-full px-3.5 py-2 text-xs font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                            >
                              Valider le devis ({formatUsd(inc.quoteAmount)})
                            </button>
                          )}

                          {inc.stage === 'valide' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleReceiveInterventionInvoice(
                                  inc,
                                  Math.max(10, inc.quoteAmount - 5)
                                )
                              }
                              className="w-full px-3.5 py-2 text-xs font-medium text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                            >
                              Enregistrer facture finale (
                              {formatUsd(Math.max(10, inc.quoteAmount - 5))})
                            </button>
                          )}

                          {inc.stage === 'facture' && (
                            <button
                              type="button"
                              onClick={() => handleReleaseIncidentFunds(inc)}
                              className="w-full px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                            >
                              Libérer le paiement (
                              {formatUsd(inc.invoiceAmount || inc.quoteAmount)})
                            </button>
                          )}

                          {inc.stage === 'paye' && (
                            <span className="text-xs font-semibold text-emerald-700 px-3 py-2">
                              ✓ Dossier soldé & archivé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* =========================================================
              TAB 4: HISTORIQUE & TRAÇABILITÉ 360° (PAR BIEN OU IMMEUBLE)
             ========================================================= */}
          {activeTab === 'historique' && (
            <div className="space-y-6">
              <section className="border border-slate-200 bg-white rounded-lg p-6 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Mémoire & Historique 360° (« Où est passé mon argent ? »)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sélectionnez un bien (ex: Appartement 12, Villa Les Acacias) ou un immeuble entier pour retrouver loyers, paiements, incidents, factures et consommations.
                    </p>
                  </div>

                  <div className="min-w-[260px]">
                    <select
                      value={selectedHistoryScope}
                      onChange={(e) => setSelectedHistoryScope(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-[#1E40AF]"
                    >
                      <option value="ALL">
                        Tout le patrimoine ({history.length} écritures)
                      </option>
                      <optgroup label="Vue globale par Immeuble">
                        {buildingGroups.map((g) => (
                          <option key={g} value={`GROUP:${g}`}>
                            {g} (Consolidé)
                          </option>
                        ))}
                        <option value="GROUP:ISOLATED">
                          Toutes les Maisons Isolées
                        </option>
                      </optgroup>
                      <optgroup label="Vue détaillée par Bien">
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.groupName || 'Maison isolée'})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Filtered Ledger Entries */}
                <div className="divide-y divide-slate-200">
                  {history
                    .filter((h) => {
                      if (selectedHistoryScope === 'ALL') return true;
                      if (selectedHistoryScope === 'GROUP:ISOLATED')
                        return h.groupName === null;
                      if (selectedHistoryScope.startsWith('GROUP:')) {
                        const g = selectedHistoryScope.replace('GROUP:', '');
                        return h.groupName === g;
                      }
                      return h.propertyId === selectedHistoryScope;
                    })
                    .map((entry) => {
                      const propObj = properties.find(
                        (p) => p.id === entry.propertyId
                      );
                      return (
                        <div
                          key={entry.id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="font-mono-tabular">{entry.date}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-800">
                                {propObj?.name || 'Patrimoine'}
                              </span>
                              {entry.channel && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#1E40AF] font-medium">
                                    {entry.channel}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {entry.title}
                            </div>
                            <p className="text-slate-600">{entry.detail}</p>
                          </div>

                          {entry.amount !== undefined && (
                            <div className="text-right font-mono-tabular shrink-0">
                              <span
                                className={`text-sm font-semibold ${
                                  entry.direction === 'entree'
                                    ? 'text-emerald-700'
                                    : entry.direction === 'sortie'
                                    ? 'text-red-700'
                                    : 'text-slate-900'
                                }`}
                              >
                                {entry.direction === 'entree'
                                  ? `+${formatUsd(entry.amount)}`
                                  : entry.direction === 'sortie'
                                  ? `-${formatUsd(entry.amount)}`
                                  : formatUsd(entry.amount)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </section>
            </div>
          )}

          {/* =========================================================
              TAB 5: PORTAIL LOCATAIRE INTERACTIF (CÔTÉ LOCATAIRE)
             ========================================================= */}
          {activeTab === 'locataire' && (
            <TenantPortalView
              properties={properties}
              incidents={incidents}
              history={history}
              authenticatedPropertyId={authenticatedTenantPropId}
              onAuthenticateTenant={(propId) => {
                setAuthenticatedTenantPropId(propId);
                if (propId) {
                  const found = properties.find((p) => p.id === propId);
                  if (found) {
                    triggerFeedback(
                      `Connecté à l’espace locataire : ${found.name} (${found.tenantName || 'Locataire'}).`
                    );
                  }
                }
              }}
              isIsolatedTenantMode={isIsolatedTenantMode}
              onToggleIsolatedMode={setIsIsolatedTenantMode}
              onTenantPayRentAndCharges={handleRecordPayment}
              onTenantReportIncident={(propId, cat, title, msg) =>
                handleCreateIncident(propId, cat, title, msg)
              }
              onTenantSubmitMeterReadings={(propId, kwh, m3) => {
                handleUpdateMeterWeight(propId, kwh, m3);
                triggerFeedback(
                  `Index compteurs (${kwh} kWh / ${m3} m³) transmis par le locataire et synchronisés.`
                );
              }}
            />
          )}
        </main>
      </div>

      {/* =========================================================
          MODAL 1: PAIEMENT MOBILE MONEY & VIREMENT GRANDES SOMMES
         ========================================================= */}
      {paymentModalProp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <div className="text-xs font-semibold text-[#1E40AF]">
                  Synchronisation Automatique des Encaissements
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  Encaisser {paymentModalProp.name} ({paymentModalProp.tenantName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalProp(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Loyer de base :</span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {formatUsd(paymentModalProp.rentAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Charges réparties (Électricité, Eau, autres) :
                </span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {formatUsd(
                    paymentModalProp.charges
                      .filter((c) => !c.paid)
                      .reduce((s, c) => s + c.amount, 0)
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-sm">
                <span className="text-slate-900">Total à enregistrer :</span>
                <span className="font-mono-tabular text-[#1E40AF]">
                  {formatUsd(
                    paymentModalProp.rentAmount +
                      paymentModalProp.charges
                        .filter((c) => !c.paid)
                        .reduce((s, c) => s + c.amount, 0)
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="block font-semibold text-slate-800">
                Canal de réception (Mobile Money ou Virement pour grandes sommes) :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    'Orange Money',
                    'Wave Mobile',
                    'MTN MoMo',
                    'Airtel Money',
                    'Virement Bancaire (Grandes sommes)',
                    'Chèque Certifié',
                  ] as PaymentChannel[]
                ).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-colors cursor-pointer ${
                      selectedChannel === ch
                        ? 'border-[#1E40AF] bg-blue-50/50 text-[#1E40AF]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPaymentModalProp(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRecordPayment(paymentModalProp.id, selectedChannel)
                }
                className="px-4 py-2 text-xs font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmer la réception ({selectedChannel})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: AJOUTER UN BIEN (APPARTEMENT, MAISON ISOLÉE, CHAMBRE OU AUTRE)
         ========================================================= */}
      {isAddPropOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Ajouter un nouveau bien au patrimoine LOCANA
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compatible Immeubles multi-appartements, Maisons isolées, Chambres ou tout autre bien personnalisé.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPropOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  1. Type de bien
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'Appartement',
                      'Maison',
                      'Chambre',
                      'Studio',
                      'Autre',
                    ] as PropertyCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setNewPropCategory(cat);
                        if (cat === 'Maison') {
                          setNewPropGroupMode('isolated');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                        newPropCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'Autre' ? '+ Autre (Écrire soi-même)' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {newPropCategory === 'Autre' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Précisez le type de bien :
                  </label>
                  <input
                    type="text"
                    value={newPropCustomCategory}
                    onChange={(e) => setNewPropCustomCategory(e.target.value)}
                    placeholder="Ex: Entrepôt, Boutique, Duplex, Terrain..."
                    className="w-full px-3 py-2 border border-[#1E40AF] rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    2. Nom ou numéro du bien
                  </label>
                  <input
                    type="text"
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    placeholder="Ex: Appartement 14 ou Maison Lot 8"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    3. Loyer mensuel ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPropRent}
                    onChange={(e) => setNewPropRent(e.target.value)}
                    className="w-full px-3 py-2 font-mono-tabular border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Building Group vs Standalone House */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-800">
                  4. Rattachement (Immeuble ou Maison isolée)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPropGroupMode('isolated')}
                    className={`p-2.5 rounded-lg border text-left font-medium cursor-pointer ${
                      newPropGroupMode === 'isolated'
                        ? 'border-[#1E40AF] bg-blue-50/40 text-[#1E40AF]'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Maison / Bien isolé (Aucun immeuble)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPropGroupMode('existing')}
                    className={`p-2.5 rounded-lg border text-left font-medium cursor-pointer ${
                      newPropGroupMode === 'existing'
                        ? 'border-[#1E40AF] bg-blue-50/40 text-[#1E40AF]'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Rattacher à un immeuble existant
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPropGroupMode('custom')}
                    className={`p-2.5 rounded-lg border text-left font-medium cursor-pointer ${
                      newPropGroupMode === 'custom'
                        ? 'border-[#1E40AF] bg-blue-50/40 text-[#1E40AF]'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    + Créer un nouvel immeuble / groupe
                  </button>
                </div>

                {newPropGroupMode === 'existing' && (
                  <select
                    value={newPropGroupName}
                    onChange={(e) => setNewPropGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg mt-2"
                  >
                    {buildingGroups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                )}

                {newPropGroupMode === 'custom' && (
                  <input
                    type="text"
                    value={newPropCustomGroup}
                    onChange={(e) => setNewPropCustomGroup(e.target.value)}
                    placeholder="Nom du nouvel ensemble (ex: Immeuble C, Résidence du Fleuve...)"
                    className="w-full px-3 py-2 border border-[#1E40AF] rounded-lg mt-2"
                  />
                )}
              </div>

              {/* Occupancy & Tenant Info */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPropOccupied}
                    onChange={(e) => setNewPropOccupied(e.target.checked)}
                    className="rounded border-slate-300 text-[#1E40AF]"
                  />
                  <span>Ce bien est actuellement occupé par un locataire</span>
                </label>

                {newPropOccupied ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newPropTenant}
                      onChange={(e) => setNewPropTenant(e.target.value)}
                      placeholder="Nom complet du locataire"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newPropPhone}
                      onChange={(e) => setNewPropPhone(e.target.value)}
                      placeholder="Téléphone Mobile Money (+243...)"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="text-amber-800">
                    Le bien sera créé avec le statut « Vacant ». Si vos suggestions automatiques sont activées, LOCANA vous proposera immédiatement une agence partenaire.
                  </p>
                )}
              </div>

              {addPropError && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 font-medium">
                  {addPropError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddPropOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Enregistrer ce bien dans LOCANA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
