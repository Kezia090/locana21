import React, { useState, useMemo } from 'react';
import { PropertyUnit, formatUsd } from '../data/locanaData';
import { Zap, Check, Calculator } from 'lucide-react';

interface UtilitySplitterSectionProps {
  properties: PropertyUnit[];
  groups: string[];
  onApplySplit: (
    billLabel: string,
    periodLabel: string,
    allocations: Array<{
      propertyId: string;
      amount: number;
      consumptionUnits: string;
    }>
  ) => void;
  onUpdateMeterWeight: (propertyId: string, kwh: number, m3: number) => void;
}

const PRESET_BILL_TYPES = [
  'Électricité',
  'Eau',
  'Internet / Fibre Optique',
  'Gardiennage & Sécurité',
  'Carburant Groupe Électrogène',
  'Ordures & Assainissement',
  'Autre',
] as const;

export const UtilitySplitterSection: React.FC<UtilitySplitterSectionProps> = ({
  properties,
  groups,
  onApplySplit,
  onUpdateMeterWeight,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('Électricité');
  const [customBillName, setCustomBillName] = useState<string>('');
  const [targetScope, setTargetScope] = useState<string>('Immeuble A');
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState<string>('154');
  const [commonAreaSharePct, setCommonAreaSharePct] = useState<number>(12);
  const [splitMethod, setSplitMethod] = useState<'compteurs' | 'egal' | 'prorata_loyer'>('compteurs');
  const [periodLabel, setPeriodLabel] = useState<string>('Octobre 2026');
  const [onlyOccupied, setOnlyOccupied] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const finalBillLabel =
    selectedPreset === 'Autre'
      ? customBillName.trim() || 'Charge personnalisée'
      : selectedPreset;

  const targetProperties = useMemo(() => {
    return properties.filter((p) => {
      if (onlyOccupied && !p.occupied) return false;
      if (targetScope === 'ALL') return true;
      if (targetScope === 'ISOLATED') return p.groupName === null;
      if (targetScope.startsWith('PROP:')) {
        return p.id === targetScope.replace('PROP:', '');
      }
      return p.groupName === targetScope;
    });
  }, [properties, targetScope, onlyOccupied]);

  const allocations = useMemo(() => {
    const totalNum = Math.max(0, Number(totalInvoiceAmount) || 0);
    const count = targetProperties.length;
    if (count === 0 || totalNum <= 0) return [];

    const isWater = selectedPreset === 'Eau';

    if (splitMethod === 'egal') {
      const baseShare = Math.floor(totalNum / count);
      const remainder = Math.round(totalNum - baseShare * count);
      return targetProperties.map((p, idx) => ({
        property: p,
        amount: idx === 0 ? baseShare + remainder : baseShare,
        consumptionUnits: `Part fixe égale (1/${count})`,
      }));
    }

    if (splitMethod === 'prorata_loyer') {
      const sumRent = targetProperties.reduce((acc, p) => acc + p.rentAmount, 0) || 1;
      return targetProperties.map((p) => {
        const share = Math.round((p.rentAmount / sumRent) * totalNum);
        return {
          property: p,
          amount: share,
          consumptionUnits: `Prorata loyer (${Math.round((p.rentAmount / sumRent) * 100)} %)`,
        };
      });
    }

    // Mode "compteurs": parties communes réparties également + consommation au relevé compteur
    const commonPool = (totalNum * commonAreaSharePct) / 100;
    const meterPool = totalNum - commonPool;
    const commonPerUnit = commonPool / count;

    const totalWeight =
      targetProperties.reduce(
        (acc, p) => acc + (isWater ? p.waterWeightM3 : p.meterWeightKwh),
        0
      ) || 1;

    return targetProperties.map((p) => {
      const unitReading = isWater ? p.waterWeightM3 : p.meterWeightKwh;
      const meterCost = (unitReading / totalWeight) * meterPool;
      const computedAmount = Math.round(commonPerUnit + meterCost);
      const unitSymbol = isWater ? 'm³' : 'kWh';

      return {
        property: p,
        amount: computedAmount,
        consumptionUnits: `${unitReading} ${unitSymbol} + ${commonAreaSharePct}% communs`,
      };
    });
  }, [
    targetProperties,
    totalInvoiceAmount,
    splitMethod,
    commonAreaSharePct,
    selectedPreset,
  ]);

  const sumAllocated = allocations.reduce((acc, item) => acc + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedPreset === 'Autre' && !customBillName.trim()) {
      setErrorMsg('Veuillez saisir le nom de la facture personnalisée dans le champ « Autre ».');
      return;
    }

    const totalNum = Number(totalInvoiceAmount);
    if (Number.isNaN(totalNum) || totalNum <= 0) {
      setErrorMsg('Veuillez indiquer un montant total de facture supérieur à 0 $.');
      return;
    }

    if (allocations.length === 0) {
      setErrorMsg('Aucun bien ne correspond au groupe sélectionné.');
      return;
    }

    onApplySplit(
      finalBillLabel,
      periodLabel,
      allocations.map((a) => ({
        propertyId: a.property.id,
        amount: a.amount,
        consumptionUnits: a.consumptionUnits,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <section className="border border-slate-200 bg-white rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#1E40AF] font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Calculateur Automatique de Charges & Compteurs</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mt-1">
              Répartition Intelligente des Factures (Électricité, Eau, Internet ou Autre)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              LOCANA connaît le nombre de biens, les index de compteurs individuels et la quote-part des parties communes. Plus aucun calcul manuel.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedPreset('Électricité');
                setTargetScope('Immeuble A');
                setTotalInvoiceAmount('154');
                setCommonAreaSharePct(12);
                setSplitMethod('compteurs');
              }}
              className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Charger exemple Immeuble A (38 $ / 51 $ / 27 $)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-6 space-y-6">
          {/* Step 1: Choose Bill Type including Custom "Autre" */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-800">
              1. Nature de la facture à répartir ou imputer
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_BILL_TYPES.map((type) => {
                const active = selectedPreset === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedPreset(type)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type === 'Autre' ? '+ Autre (Écrire soi-même)' : type}
                  </button>
                );
              })}
            </div>

            {selectedPreset === 'Autre' && (
              <div className="pt-2 max-w-md">
                <label
                  htmlFor="custom-bill-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Précisez l’intitulé exact de votre charge ou facture :
                </label>
                <input
                  id="custom-bill-input"
                  type="text"
                  value={customBillName}
                  onChange={(e) => setCustomBillName(e.target.value)}
                  placeholder="Ex: Vidange fosse septique, Entretien pompe forage, Taxe voirie..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#1E40AF] rounded-lg text-slate-900 focus:outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Step 2: Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label
                htmlFor="split-scope"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                2. Cible (Immeuble, Maisons ou Bien unique)
              </label>
              <select
                id="split-scope"
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#1E40AF]"
              >
                {groups.map((g) => (
                  <option key={g} value={g}>
                    Groupe : {g}
                  </option>
                ))}
                <option value="ISOLATED">Maisons isolées (Hors immeuble)</option>
                <option value="ALL">Tout le patrimoine ({properties.length} biens)</option>
                <optgroup label="Imputer à un seul bien">
                  {properties.map((p) => (
                    <option key={p.id} value={`PROP:${p.id}`}>
                      {p.name} ({p.groupName || 'Maison isolée'})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label
                htmlFor="split-amount"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                3. Montant total de la facture ($)
              </label>
              <input
                id="split-amount"
                type="number"
                min={1}
                step="1"
                value={totalInvoiceAmount}
                onChange={(e) => setTotalInvoiceAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono-tabular bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div>
              <label
                htmlFor="split-method"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                4. Règle de calcul automatique
              </label>
              <select
                id="split-method"
                value={splitMethod}
                onChange={(e) =>
                  setSplitMethod(
                    e.target.value as 'compteurs' | 'egal' | 'prorata_loyer'
                  )
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#1E40AF]"
              >
                <option value="compteurs">
                  Relevés sous-compteurs + Parties communes
                </option>
                <option value="egal">Répartition à parts égales</option>
                <option value="prorata_loyer">Au prorata de la valeur locative</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="split-period"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                5. Période de facturation
              </label>
              <input
                id="split-period"
                type="text"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
          </div>

          {/* Common Area Slider & Vacancy Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            {splitMethod === 'compteurs' ? (
              <div className="flex-1 max-w-md space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">
                    Quote-part des parties communes (couloirs, pompe, éclairage extérieur) :
                  </span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {commonAreaSharePct} %
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={commonAreaSharePct}
                  onChange={(e) => setCommonAreaSharePct(Number(e.target.value))}
                  className="w-full accent-[#1E40AF] cursor-pointer"
                />
              </div>
            ) : (
              <div className="text-slate-600">
                Calcul automatique selon la méthode sélectionnée ({splitMethod === 'egal' ? 'parts égales' : 'prorata des loyers'}).
              </div>
            )}

            <label className="inline-flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
              <input
                type="checkbox"
                checked={onlyOccupied}
                onChange={(e) => setOnlyOccupied(e.target.checked)}
                className="rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
              />
              <span>Exclure automatiquement les biens vacants (inoccupés)</span>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Live Breakdown Preview Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>
                  Aperçu des montants générés pour « {finalBillLabel} » ({allocations.length} biens)
                </span>
              </div>
              <div className="font-mono-tabular text-slate-600">
                Total réparti :{' '}
                <span className="font-semibold text-slate-900">
                  {formatUsd(sumAllocated)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-slate-500">
                    <th className="py-2.5 px-4 font-semibold">Bien & Type</th>
                    <th className="py-2.5 px-4 font-semibold">Locataire</th>
                    <th className="py-2.5 px-4 font-semibold">
                      Consommation compteur ({selectedPreset === 'Eau' ? 'm³' : 'kWh'})
                    </th>
                    <th className="py-2.5 px-4 font-semibold">Détail du calcul</th>
                    <th className="py-2.5 px-4 font-semibold text-right">
                      Montant dû généré
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allocations.map(({ property, amount, consumptionUnits }) => {
                    const isWater = selectedPreset === 'Eau';
                    const currentReading = isWater
                      ? property.waterWeightM3
                      : property.meterWeightKwh;

                    return (
                      <tr key={property.id} className="h-11 hover:bg-slate-50/80">
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-slate-900">
                            {property.name}
                          </span>
                          <span className="text-slate-400"> · </span>
                          <span className="text-slate-500">
                            {property.groupName || 'Maison isolée'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {property.occupied ? (
                            property.tenantName
                          ) : (
                            <span className="text-amber-700 font-medium">Vacant</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={currentReading}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                onUpdateMeterWeight(
                                  property.id,
                                  isWater ? property.meterWeightKwh : val,
                                  isWater ? val : property.waterWeightM3
                                );
                              }}
                              className="w-20 px-2 py-1 text-xs font-mono-tabular border border-slate-200 rounded bg-white text-slate-900"
                            />
                            <span className="text-slate-500 font-mono-tabular">
                              {isWater ? 'm³' : 'kWh'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono-tabular">
                          {consumptionUnits}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono-tabular font-semibold text-[#1E40AF]">
                          {formatUsd(amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500">
              En validant, chaque bien reçoit automatiquement sa ligne de facture et le locataire la voit dans son portail.
            </p>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-medium text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Générer et imputer ces montants dus ({formatUsd(sumAllocated)})</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
