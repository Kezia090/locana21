import React, { useState } from 'react';
import {
  PropertyUnit,
  IncidentItem,
  HistoryLedgerEntry,
  PaymentChannel,
  formatUsd,
} from '../data/locanaData';
import {
  Smartphone,
  Building2,
  Wrench,
  Check,
  Send,
  Gauge,
  FileText,
  KeyRound,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Phone,
  Hash,
  Eye,
} from 'lucide-react';

interface TenantPortalViewProps {
  properties: PropertyUnit[];
  incidents: IncidentItem[];
  history: HistoryLedgerEntry[];
  authenticatedPropertyId: string | null;
  onAuthenticateTenant: (propertyId: string | null) => void;
  isIsolatedTenantMode: boolean;
  onToggleIsolatedMode: (isolated: boolean) => void;
  onTenantPayRentAndCharges: (propertyId: string, channel: PaymentChannel) => void;
  onTenantReportIncident: (
    propertyId: string,
    category: string,
    title: string,
    message: string
  ) => void;
  onTenantSubmitMeterReadings: (propertyId: string, kwh: number, m3: number) => void;
}

const INCIDENT_CATEGORIES = [
  'Plomberie / Fuite',
  'Électricité / Disjoncteur',
  'Climatisation & Ventilation',
  'Serrurerie & Ouvertures',
  'Toiture & Étanchéité',
  'Autre',
] as const;

const PAYMENT_METHODS: Array<{
  channel: PaymentChannel;
  type: 'mobile' | 'large';
  desc: string;
}> = [
  {
    channel: 'Orange Money',
    type: 'mobile',
    desc: 'Validation USSD instantanée · Montants courants (< 500 $)',
  },
  {
    channel: 'Wave Mobile',
    type: 'mobile',
    desc: 'Paiement mobile rapide avec reçu numérique automatique',
  },
  {
    channel: 'MTN MoMo',
    type: 'mobile',
    desc: 'Confirmation instantanée par notification push',
  },
  {
    channel: 'Airtel Money',
    type: 'mobile',
    desc: 'Paiement mobile synchronisé avec quittancement immédiat',
  },
  {
    channel: 'Virement Bancaire (Grandes sommes)',
    type: 'large',
    desc: 'Recommandé pour Villas, Locaux commerciaux et loyers > 500 $ (hors plafond Mobile Money)',
  },
  {
    channel: 'Chèque Certifié',
    type: 'large',
    desc: 'Règlement sécurisé grandes sommes avec numéro de bordereau',
  },
];

function normalizePhone(val: string): string {
  return val.replace(/[\s\-().+]/g, '').toLowerCase();
}

export const TenantPortalView: React.FC<TenantPortalViewProps> = ({
  properties,
  incidents,
  history,
  authenticatedPropertyId,
  onAuthenticateTenant,
  isIsolatedTenantMode,
  onToggleIsolatedMode,
  onTenantPayRentAndCharges,
  onTenantReportIncident,
  onTenantSubmitMeterReadings,
}) => {
  // Login form state
  const [loginInput, setLoginInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const occupiedProperties = properties.filter((p) => p.occupied);
  const activeUnit =
    properties.find((p) => p.id === authenticatedPropertyId) || null;

  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<PaymentChannel>(
    activeUnit && activeUnit.rentAmount >= 500
      ? 'Virement Bancaire (Grandes sommes)'
      : 'Orange Money'
  );

  // Incident form state
  const [incCategory, setIncCategory] = useState<string>('Plomberie / Fuite');
  const [customIncCategory, setCustomIncCategory] = useState<string>('');
  const [incTitle, setIncTitle] = useState<string>('');
  const [incMessage, setIncMessage] = useState<string>('');
  const [incError, setIncError] = useState<string>('');

  // Meter reading state
  const [kwhInput, setKwhInput] = useState<string>(
    activeUnit ? String(activeUnit.meterWeightKwh) : '142'
  );
  const [m3Input, setM3Input] = useState<string>(
    activeUnit ? String(activeUnit.waterWeightM3) : '9'
  );

  const syncUnitDefaults = (unit: PropertyUnit) => {
    setKwhInput(String(unit.meterWeightKwh));
    setM3Input(String(unit.waterWeightM3));
    setSelectedPaymentChannel(
      unit.rentAmount >= 500
        ? 'Virement Bancaire (Grandes sommes)'
        : 'Orange Money'
    );
  };

  // Handle Login by Property ID, Unit Name, or Phone Number
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const raw = loginInput.trim();
    if (!raw) {
      setLoginError(
        'Veuillez saisir un identifiant de bien (ex: prop-12) ou un numéro de téléphone (ex: +243 81 302 45 19).'
      );
      return;
    }

    const qLower = raw.toLowerCase();
    const qDigits = normalizePhone(raw);

    const matched = properties.find((p) => {
      const idMatch = p.id.toLowerCase() === qLower;
      const nameMatch = p.name.toLowerCase() === qLower;
      const phoneDigits = normalizePhone(p.tenantPhone || '');
      const phoneMatch =
        qDigits.length >= 4 &&
        phoneDigits.length >= 4 &&
        (phoneDigits === qDigits || phoneDigits.endsWith(qDigits));

      return idMatch || nameMatch || phoneMatch;
    });

    if (!matched) {
      setLoginError(
        `Aucun logement trouvé pour « ${raw} ». Vérifiez l'ID du bien (ex: prop-12) ou le numéro de téléphone du locataire.`
      );
      return;
    }

    syncUnitDefaults(matched);
    onAuthenticateTenant(matched.id);
    setLoginInput('');
  };

  const handleQuickLogin = (unit: PropertyUnit) => {
    setLoginError('');
    syncUnitDefaults(unit);
    onAuthenticateTenant(unit.id);
  };

  // ============================================================================
  // VIEW 1: TENANT LOGIN SIMULATION SCREEN (When not logged in as a specific unit)
  // ============================================================================
  if (!activeUnit) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="border border-slate-200 bg-white rounded-lg overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-slate-200 bg-slate-900 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <KeyRound className="w-4 h-4" />
              <span>Accès Sécurisé Locataire · Vue Individuelle Isolée</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-semibold text-white mt-1.5">
              Connexion au Portail Locataire LOCANA
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Saisissez l’identifiant de votre logement (ID du bien) ou votre numéro de téléphone Mobile Money pour consulter uniquement vos quittances, vos consommations (électricité/eau) et le suivi de vos incidents techniques, sans accès aux données du propriétaire.
            </p>
          </div>

          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Login Form by Property ID or Phone Number */}
            <form
              onSubmit={handleLoginSubmit}
              className="lg:col-span-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="tenant-login-input"
                  className="block text-xs font-semibold text-slate-900 mb-1.5"
                >
                  Identifiant du Bien (ID) ou Numéro de Téléphone
                </label>
                <div className="relative">
                  <input
                    id="tenant-login-input"
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Ex: prop-12 ou +243 81 302 45 19"
                    className="w-full px-3.5 py-2.5 text-xs font-mono-tabular bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E40AF]"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Formats acceptés : ID exact (<code className="font-mono-tabular text-slate-700">prop-12</code>), nom du lot (<code className="font-mono-tabular text-slate-700">Appartement 12</code>) ou téléphone complet / 6 derniers chiffres (<code className="font-mono-tabular text-slate-700">3024519</code>).
                </p>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isIsolatedTenantMode}
                  onChange={(e) => onToggleIsolatedMode(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#1E40AF]"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Isoler complètement l’écran Locataire
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Masque la barre latérale et les indicateurs financiers du propriétaire pendant la session du locataire.
                  </span>
                </div>
              </label>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accéder à mon espace locataire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Right: Demo Credentials Directory for Instant Testing */}
            <div className="lg:col-span-6 border border-slate-200 rounded-lg bg-slate-50/60 overflow-hidden">
              <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  Identifiants de test disponibles (Clic rapide ou saisie)
                </span>
                <span className="text-slate-500 font-mono-tabular">
                  {occupiedProperties.length} logements actifs
                </span>
              </div>

              <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                {occupiedProperties.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 truncate">
                          {unit.name}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 truncate">
                          {unit.tenantName}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-tabular text-slate-500">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <Hash className="w-3 h-3 text-[#1E40AF]" />
                          ID: <strong>{unit.id}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-emerald-700" />
                          {unit.tenantPhone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setLoginInput(unit.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      >
                        Remplir ID
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin(unit)}
                        className="px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        Connecter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: AUTHENTICATED TENANT DASHBOARD (SPECIFIC BILLING & INCIDENT STATUS)
  // ============================================================================
  const unpaidChargesSum = activeUnit.charges
    .filter((c) => !c.paid)
    .reduce((acc, c) => acc + c.amount, 0);

  const totalChargesSum = activeUnit.charges.reduce((acc, c) => acc + c.amount, 0);

  const rentDue = activeUnit.rentStatus === 'paye' ? 0 : activeUnit.rentAmount;
  const totalDueNow = rentDue + unpaidChargesSum;

  const unitIncidents = incidents.filter((i) => i.propertyId === activeUnit.id);
  const unitHistory = history.filter((h) => h.propertyId === activeUnit.id);

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIncError('');

    const finalCat =
      incCategory === 'Autre'
        ? customIncCategory.trim() || 'Autre intervention'
        : incCategory;

    if (!incTitle.trim() || !incMessage.trim()) {
      setIncError(
        'Veuillez indiquer l’objet de la panne et une courte description (ex: « La fuite vient de la cuisine »).'
      );
      return;
    }

    onTenantReportIncident(
      activeUnit.id,
      finalCat,
      incTitle.trim(),
      incMessage.trim()
    );
    setIncTitle('');
    setIncMessage('');
    setCustomIncCategory('');
  };

  return (
    <div className="space-y-6">
      {/* Authenticated Tenant Session Header */}
      <section className="border border-slate-200 bg-slate-900 text-white rounded-lg p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Session Locataire Authentifiée</span>
              <span className="text-slate-500">·</span>
              <span className="font-mono-tabular text-slate-300">
                ID Bien : {activeUnit.id}
              </span>
              {activeUnit.tenantPhone && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono-tabular text-slate-300">
                    Tél : {activeUnit.tenantPhone}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-lg lg:text-xl font-semibold text-white">
              {activeUnit.name} — {activeUnit.tenantName || 'Locataire'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Vous visualisez uniquement la facturation (loyer et charges réparties) et les incidents techniques rattachés à votre logement ({activeUnit.groupName || 'Maison individuelle'}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              onClick={() => onToggleIsolatedMode(!isIsolatedTenantMode)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                isIsolatedTenantMode
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>
                {isIsolatedTenantMode
                  ? 'Mode Isolé Actif (Afficher barre Proprio)'
                  : 'Isoler l’écran Locataire'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onAuthenticateTenant(null)}
              className="px-3.5 py-2 text-xs font-medium bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Changer d’ID / Déconnexion</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tenant-Specific KPI Summary Strip (Strictly scoped to this unit!) */}
      <section
        aria-label="Synthèse du logement"
        className="border border-slate-200 bg-white rounded-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
      >
        <div className="p-5">
          <div className="text-xs text-slate-500">Solde Restant à Payer ce Mois</div>
          <div
            className={`text-2xl font-semibold font-mono-tabular mt-1 ${
              totalDueNow === 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {formatUsd(totalDueNow)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalDueNow === 0
              ? `Quittance acquittée (${activeUnit.lastPaymentChannel || 'Mobile Money'})`
              : `Loyer (${formatUsd(rentDue)}) + Charges (${formatUsd(unpaidChargesSum)})`}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-500">
            Consommations & Charges du Logement
          </div>
          <div className="text-2xl font-semibold font-mono-tabular text-slate-900 mt-1">
            {formatUsd(totalChargesSum)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono-tabular">
            Index actuels : {activeUnit.meterWeightKwh} kWh · {activeUnit.waterWeightM3} m³
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-500">
            Incidents Techniques sur {activeUnit.name}
          </div>
          <div className="text-2xl font-semibold font-mono-tabular text-slate-900 mt-1">
            {unitIncidents.length} dossier(s)
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {unitIncidents.filter((i) => i.stage !== 'paye').length > 0
              ? `${
                  unitIncidents.filter((i) => i.stage !== 'paye').length
                } intervention(s) en cours de traitement`
              : 'Toutes les réparations sont clôturées'}
          </div>
        </div>
      </section>

      {/* Main Two-Column Tenant Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rent, Charges & Payment Processing */}
        <div className="lg:col-span-7 space-y-6">
          <section className="border border-slate-200 bg-white rounded-lg p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-slate-500">
                  {activeUnit.groupName || 'Maison individuelle hors immeuble'} · Bail depuis le {activeUnit.leaseStart}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  Détail de Facturation — {activeUnit.name}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Statut du mois</span>
                {totalDueNow === 0 ? (
                  <span className="text-xs font-semibold text-emerald-700">
                    Payé · Réf {activeUnit.lastPaymentRef || 'OM-2609'}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700">
                    En attente · {formatUsd(totalDueNow)} à régler
                  </span>
                )}
              </div>
            </div>

            {/* Line Items Breakdown */}
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
              <div className="p-3.5 flex items-center justify-between bg-slate-50/70">
                <div>
                  <span className="font-semibold text-slate-900">Loyer mensuel</span>
                  <span className="text-slate-500 block mt-0.5">
                    {activeUnit.category === 'Autre'
                      ? activeUnit.customCategoryLabel
                      : activeUnit.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono-tabular font-semibold text-slate-900 block">
                    {formatUsd(activeUnit.rentAmount)}
                  </span>
                  <span
                    className={`text-[11px] ${
                      activeUnit.rentStatus === 'paye'
                        ? 'text-emerald-700 font-medium'
                        : 'text-amber-700 font-medium'
                    }`}
                  >
                    {activeUnit.rentStatus === 'paye' ? 'Payé' : 'À régler'}
                  </span>
                </div>
              </div>

              {activeUnit.charges.map((chg) => (
                <div
                  key={chg.id}
                  className="p-3.5 flex items-center justify-between bg-white"
                >
                  <div>
                    <span className="font-medium text-slate-900">{chg.category}</span>
                    <span className="text-slate-500 block mt-0.5 font-mono-tabular">
                      {chg.consumptionUnits || chg.periodLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-tabular font-semibold text-slate-900 block">
                      {formatUsd(chg.amount)}
                    </span>
                    <span
                      className={`text-[11px] ${
                        chg.paid
                          ? 'text-emerald-700 font-medium'
                          : 'text-amber-700 font-medium'
                      }`}
                    >
                      {chg.paid ? 'Payé' : 'À régler'}
                    </span>
                  </div>
                </div>
              ))}

              <div className="p-4 flex items-center justify-between bg-slate-50 font-semibold">
                <span className="text-slate-900">
                  Total Mensuel (Loyer + Charges réparties)
                </span>
                <span className="text-base font-mono-tabular text-[#1E40AF]">
                  {formatUsd(activeUnit.rentAmount + totalChargesSum)}
                </span>
              </div>
            </div>

            {/* Payment Channel Selector: Mobile Money vs High-Amount Bank Options */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-900">
                  Choisir mon moyen de paiement :
                </label>
                {activeUnit.rentAmount >= 500 && (
                  <span className="text-[11px] font-medium text-[#1E40AF]">
                    Montant élevé : Virement / Chèque certifié recommandé
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = selectedPaymentChannel === pm.channel;
                  return (
                    <button
                      key={pm.channel}
                      type="button"
                      onClick={() => setSelectedPaymentChannel(pm.channel)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50/40'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1.5">
                          {pm.type === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-[#1E40AF]" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-slate-700" />
                          )}
                          <span>{pm.channel}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#1E40AF]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {pm.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onTenantPayRentAndCharges(activeUnit.id, selectedPaymentChannel)
                  }
                  className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {totalDueNow > 0
                      ? `Payer ${formatUsd(totalDueNow)} maintenant via ${selectedPaymentChannel}`
                      : `Simuler un nouveau règlement (${formatUsd(
                          activeUnit.rentAmount + totalChargesSum
                        )}) via ${selectedPaymentChannel}`}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Self-Service Meter Reading Submission */}
          <section className="border border-slate-200 bg-white rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <Gauge className="w-4 h-4 text-[#1E40AF]" />
              <span>Transmettre mes relevés de sous-compteurs (Électricité & Eau)</span>
            </div>
            <p className="text-xs text-slate-500">
              Vos index mettent à jour le calcul automatique de votre quote-part d’électricité et d’eau.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Consommation Électricité (kWh)
                </label>
                <input
                  type="number"
                  min={0}
                  value={kwhInput}
                  onChange={(e) => setKwhInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-tabular border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Consommation Eau (m³)
                </label>
                <input
                  type="number"
                  min={0}
                  value={m3Input}
                  onChange={(e) => setM3Input(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-tabular border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  onTenantSubmitMeterReadings(
                    activeUnit.id,
                    Math.max(0, Number(kwhInput) || 0),
                    Math.max(0, Number(m3Input) || 0)
                  )
                }
                className="px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Envoyer mes index
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Report Technical Incident + Track Status */}
        <div className="lg:col-span-5 space-y-6">
          <section className="border border-slate-200 bg-white rounded-lg p-6 space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E40AF]">
                <Wrench className="w-3.5 h-3.5" />
                <span>Déclaration & Suivi d’Incidents</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mt-1">
                Signaler un problème dans {activeUnit.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Votre signalement ouvre un dossier numéroté et suit les étapes : Diagnostic → Devis → Validation → Intervention.
              </p>
            </div>

            <form onSubmit={handleIncidentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Catégorie du problème
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {INCIDENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setIncCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                        incCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'Autre' ? '+ Autre (Préciser)' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {incCategory === 'Autre' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Précisez le type d’équipement ou d’incident :
                  </label>
                  <input
                    type="text"
                    value={customIncCategory}
                    onChange={(e) => setCustomIncCategory(e.target.value)}
                    placeholder="Ex: Interphone, Portail, Infiltration balcon..."
                    className="w-full px-3 py-2 border border-[#1E40AF] rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Intitulé court de la panne
                </label>
                <input
                  type="text"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  placeholder="Ex: Fuite robinet cuisine / Prise murale brûlée"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Message détaillé
                </label>
                <textarea
                  rows={3}
                  value={incMessage}
                  onChange={(e) => setIncMessage(e.target.value)}
                  placeholder="Ex: « La fuite vient de la cuisine, juste sous le robinet d’eau froide. »"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              {incError && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700">
                  {incError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer le signalement</span>
              </button>
            </form>
          </section>

          {/* Active Incidents & History for this Tenant */}
          <section className="border border-slate-200 bg-white rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>État d’avancement de mes incidents ({unitIncidents.length})</span>
            </h3>

            {unitIncidents.length === 0 ? (
              <p className="text-xs text-slate-500">
                Aucun incident signalé sur {activeUnit.name}.
              </p>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                {unitIncidents.map((inc) => (
                  <div key={inc.id} className="p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-tabular font-semibold text-slate-900">
                        Incident #{inc.ticketNumber} · {inc.title}
                      </span>
                      <span
                        className={`font-semibold ${
                          inc.stage === 'paye'
                            ? 'text-emerald-700'
                            : 'text-[#1E40AF]'
                        }`}
                      >
                        {inc.stage === 'signale' && '1/4 · Diagnostic en cours'}
                        {inc.stage === 'devis_recu' &&
                          `2/4 · Devis transmis au propriétaire (${formatUsd(inc.quoteAmount)})`}
                        {inc.stage === 'valide' &&
                          '3/4 · Devis validé · Artisan en route'}
                        {inc.stage === 'facture' &&
                          '4/4 · Réparation effectuée (Facture en validation)'}
                        {inc.stage === 'paye' && '✓ Terminé & Clôturé'}
                      </span>
                    </div>
                    <p className="text-slate-600">{inc.tenantMessage}</p>
                    <div className="text-[11px] text-slate-400">
                      Intervenant : {inc.providerName} ({inc.providerPhone}) · {inc.updatedAt}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {unitHistory.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  Mon historique personnel ({activeUnit.name}) :
                </div>
                <div className="space-y-1.5">
                  {unitHistory.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      className="text-xs p-2.5 bg-slate-50 rounded border border-slate-200/80 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="font-medium text-slate-800">{h.title}</span>
                        <span className="text-slate-400 block text-[11px]">{h.date}</span>
                      </div>
                      {h.amount !== undefined && (
                        <span className="font-mono-tabular font-semibold text-slate-900 shrink-0">
                          {formatUsd(h.amount)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
