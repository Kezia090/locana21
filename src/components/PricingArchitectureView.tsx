import React, { useState } from 'react';
import {
  PRICING_TIERS,
  ASSETS,
  formatCurrency,
  PricingTier,
} from '../data/saasData';
import { ResilientImage } from './ResilientImage';
import { ArrowRight, Check } from 'lucide-react';

interface PricingArchitectureViewProps {
  activePlanId: string;
  onSelectPlan: (tier: PricingTier, cadence: 'Mensuel' | 'Annuel') => void;
  onOpenNewInvoiceModal: () => void;
}

export const PricingArchitectureView: React.FC<PricingArchitectureViewProps> = ({
  activePlanId,
  onSelectPlan,
  onOpenNewInvoiceModal,
}) => {
  const [billingCadence, setBillingCadence] = useState<'Annuel' | 'Mensuel'>('Annuel');
  const [simulatedInvoices, setSimulatedInvoices] = useState<number>(280);
  const [simulatedTeamSize, setSimulatedTeamSize] = useState<number>(18);

  // Concrete time & cost savings calculation
  const hoursSavedMonthly = Math.round(simulatedInvoices * 0.14 + simulatedTeamSize * 1.8);
  const annualSavingsEur = hoursSavedMonthly * 65 * 12;

  return (
    <div className="space-y-10">
      {/* Hero Banner with 16:9 Generated Studio Image & Measured Scrim */}
      <section className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between z-10 bg-slate-900 text-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-300 tracking-wide">
                <span>Architecture Tarifaire & Valeur Opérationnelle</span>
                <span aria-hidden="true">·</span>
                <span>Conformité Factur-X 2026</span>
                <span aria-hidden="true">·</span>
                <span>Hébergement Européen SecNumCloud</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-wide text-white max-w-2xl">
                Unifiez la facturation récurrente, le suivi budgétaire et la trésorerie dans un seul poste de pilotage.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Nous remplaçons les feuilles de calcul fragmentées et les relances manuelles par un pipeline automatisé de facturation SEPA et de contrôle de marge par projet.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-8 text-xs">
                <div>
                  <span className="text-slate-400 block">Délai moyen d’encaissement (DSO)</span>
                  <span className="font-mono-tabular text-base font-semibold text-white mt-0.5 block">
                    -24 jours en 90 jours
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Clôture comptable mensuelle</span>
                  <span className="font-mono-tabular text-base font-semibold text-white mt-0.5 block">
                    1,5 jour au lieu de 7
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenNewInvoiceModal}
                className="px-4 py-2 text-xs font-medium bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Émettre une facture test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full">
            <ResilientImage
              src={ASSETS.heroSaasWorkspace}
              alt="Espace de direction financière et opérationnelle VeloceFlow"
              fallbackType="banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-slate-900/25 lg:to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-200">
              <span>Centre d’ingénierie financière · Lyon & Paris · Certifié ISO 27001</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism-to-Outcome Chain Section */}
      <section className="border border-slate-200 bg-white rounded-lg p-6 lg:p-8">
        <div className="pb-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            01. Chaîne de Valeur : Du Mécanisme Opérationnel au Résultat Mesurable
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Chaque module de l’interface élimine une friction administrative précise et génère un gain financier vérifiable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 pt-6">
          <div className="pb-6 lg:pb-0 lg:pr-6 space-y-3">
            <div className="text-xs text-slate-500">
              <span>Étape 01 · Objectif Utilisateur</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Éliminer les retards de facturation et les oublis de renouvellement
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Les équipes perdent en moyenne 14 heures par mois à consolider les feuilles de temps et les bons de commande avant d’émettre leurs factures.
            </p>
            <div className="pt-2 text-xs text-slate-700 font-mono-tabular">
              Mécanisme UI : Génération Factur-X en 1 clic depuis le suivi projet
            </div>
          </div>

          <div className="py-6 lg:py-0 lg:px-6 space-y-3">
            <div className="text-xs text-slate-500">
              <span>Étape 02 · Mécanisme de l’Interface</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Rapprochement SEPA automatisé & alertes d’échéance temps réel
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Synchronisation bancaire directe (DSP2 / EBICS) qui associe chaque virement entrant à la référence de facture correspondante sans saisie manuelle.
            </p>
            <div className="pt-2 text-xs text-slate-700 font-mono-tabular">
              Mécanisme UI : Statut « Payée · Rapprochée » mis à jour en temps réel
            </div>
          </div>

          <div className="pt-6 lg:pt-0 lg:pl-6 space-y-3">
            <div className="text-xs text-slate-500">
              <span>Étape 03 · Bénéfice Quantifié</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              +142 % de vélocité d’encaissement et zéro écriture orpheline
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Réduction immédiate du besoin en fonds de roulement (BFR) et export comptable FEC validé sans reprise par votre cabinet d’expertise.
            </p>
            <div className="pt-2 text-xs text-emerald-700 font-mono-tabular font-semibold">
              Résultat : +38 400 € de trésorerie moyenne libérée sur 6 mois
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Tier Cards + Interactive Cadence Selector */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              02. Offres & Niveaux d’Engagement par Taille d’Organisation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tarification transparente basée sur le volume opérationnel réel · Aucun frais caché au pourcentage du chiffre d’affaires
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setBillingCadence('Annuel')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                billingCadence === 'Annuel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Engagement Annuel (-20 %)
            </button>
            <button
              type="button"
              onClick={() => setBillingCadence('Mensuel')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                billingCadence === 'Mensuel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Facturation Mensuelle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => {
            const isCurrent = activePlanId === tier.id;
            const displayedPrice =
              billingCadence === 'Annuel'
                ? tier.annualMonthlyEquivalent
                : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={`border rounded-lg p-6 bg-white flex flex-col justify-between ${
                  tier.featured
                    ? 'border-[#1E40AF] ring-1 ring-[#1E40AF]'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    <span>{tier.audienceLabel}</span>
                    {tier.featured && (
                      <>
                        <span aria-hidden="true"> · </span>
                        <span className="text-[#1E40AF] font-semibold">
                          Recommandé PME & ETI
                        </span>
                      </>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold font-mono-tabular text-slate-900">
                        {formatCurrency(displayedPrice)}
                      </span>
                      <span className="text-xs text-slate-500">
                        HT / mois · {billingCadence === 'Annuel' ? 'facturé annuellement' : 'sans engagement'}
                      </span>
                    </div>
                  </div>

                  <dl className="pt-4 border-t border-slate-100 space-y-3 text-xs">
                    <div>
                      <dt className="text-slate-500">Capacité équipe</dt>
                      <dd className="font-medium text-slate-900 mt-0.5 font-mono-tabular">
                        {tier.metrics.usersLimit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Volume de facturation</dt>
                      <dd className="font-medium text-slate-900 mt-0.5 font-mono-tabular">
                        {tier.metrics.invoicesPerMonth}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Connectivité bancaire</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">
                        {tier.metrics.bankSync}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Comptabilité & API</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">
                        {tier.metrics.exportFormat}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Engagement de service (SLA)</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">
                        {tier.metrics.slaSupport}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectPlan(tier, billingCadence)}
                    className={`w-full py-2.5 px-4 text-xs font-medium rounded-lg transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : tier.featured
                        ? 'bg-[#1E40AF] text-white hover:bg-blue-800'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Forfait actif sur cet espace ({billingCadence})</span>
                      </>
                    ) : (
                      <span>{tier.ctaLabel}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Concrete Comparison Matrix & Interactive ROI Simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 border border-slate-200 bg-white rounded-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              03. Matrice Comparative des Quotas & Garanties Techniques
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Spécifications chiffrées par palier opérationnel
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-3 px-4 font-semibold">Paramètre Opérationnel</th>
                  <th className="py-3 px-4 font-semibold text-right">Croissance</th>
                  <th className="py-3 px-4 font-semibold text-right text-[#1E40AF]">
                    Opérations Pro
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Multi-Entités</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono-tabular">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    Sièges collaborateurs inclus
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">10 sièges</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    25 sièges
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">Illimité</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    Émissions Factur-X / mois
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">150 / mois</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    1 000 / mois
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">Illimité</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    Fréquence de synchro bancaire
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">Toutes les 6h</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    Temps réel (Webhook)
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    Temps réel + EBICS TS
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    Rétention des journaux d’audit
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">12 mois</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    36 mois
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    10 ans (Archivage légal)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    Limite de requêtes API REST
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">10 000 / jour</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    250 000 / jour
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">2 000 000 / jour</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Simulator */}
        <div className="lg:col-span-5 border border-slate-200 bg-white rounded-lg p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                Simulateur d’Impact Opérationnel (ROI)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Calculez le temps administratif économisé selon votre volumétrie actuelle.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="sim-invoices" className="font-medium text-slate-700">
                    Factures & avoirs émis par mois
                  </label>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {simulatedInvoices} factures
                  </span>
                </div>
                <input
                  id="sim-invoices"
                  type="range"
                  min={20}
                  max={1200}
                  step={10}
                  value={simulatedInvoices}
                  onChange={(e) => setSimulatedInvoices(Number(e.target.value))}
                  className="w-full accent-[#1E40AF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="sim-team" className="font-medium text-slate-700">
                    Collaborateurs saisissant des temps ou achats
                  </label>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {simulatedTeamSize} collaborateurs
                  </span>
                </div>
                <input
                  id="sim-team"
                  type="range"
                  min={3}
                  max={100}
                  step={1}
                  value={simulatedTeamSize}
                  onChange={(e) => setSimulatedTeamSize(Number(e.target.value))}
                  className="w-full accent-[#1E40AF] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500 block">
                Temps finance libéré
              </span>
              <span className="text-xl font-semibold font-mono-tabular text-slate-900 mt-0.5 block">
                {hoursSavedMonthly} h / mois
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">
                Gain de productivité annuel
              </span>
              <span className="text-xl font-semibold font-mono-tabular text-emerald-700 mt-0.5 block">
                {formatCurrency(annualSavingsEur)} / an
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Proof of Impact / Attributable Testimonials Adjacent to Claims */}
      <section className="border border-slate-200 bg-white rounded-lg p-6 lg:p-8">
        <div className="pb-6 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            04. Preuves d’Impact & Retours d’Expérience Vérifiés
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Résultats mesurés auprès de directions financières et opérationnelles utilisatrices de VeloceFlow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 pt-6">
          <article className="pb-6 lg:pb-0 lg:pr-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-mono-tabular text-emerald-700 font-semibold">
                +142 % de vélocité de facturation en 4 mois · DSO réduit de 46 à 19 jours
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                « Avant VeloceFlow, nos chefs de projet consolidaient leurs feuilles d’heures sur trois fichiers distincts et la facturation partait le 12 du mois suivant. Aujourd’hui, chaque jalon validé génère automatiquement l’échéance Factur-X et le prélèvement SEPA est rapproché dès le lendemain matin. »
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <ResilientImage
                src={ASSETS.avatarDirectriceOps}
                alt="Portrait de Claire Valmont, Directrice des Opérations"
                fallbackType="avatar"
                initials="CV"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-900">Claire Valmont</div>
                <div className="text-slate-500">
                  Directrice des Opérations · Atelier Méridien Architecture (48 collaborateurs)
                </div>
              </div>
            </div>
          </article>

          <article className="pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-mono-tabular text-emerald-700 font-semibold">
                184 000 € d’impayés résorbés au T2 2026 · Clôture mensuelle en 36 heures
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                « La visibilité en temps réel sur notre MRR et nos charges par centre de coût nous a permis d’identifier deux contrats déficitaires dès le premier mois. L’export FEC enrichi a divisé par quatre le temps de révision de nos commissaires aux comptes. »
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <ResilientImage
                src={ASSETS.avatarLeadFinance}
                alt="Portrait de Marc Delacroix, Directeur Administratif et Financier"
                fallbackType="avatar"
                initials="MD"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-900">Marc Delacroix</div>
                <div className="text-slate-500">
                  Directeur Administratif & Financier · Manufacture Horlogère Vercors
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};
