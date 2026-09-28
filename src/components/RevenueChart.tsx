import React, { useState } from 'react';
import { MonthlyRevenuePoint, formatCurrency } from '../data/saasData';

interface RevenueChartProps {
  data: MonthlyRevenuePoint[];
  extraCurrentMrr?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  extraCurrentMrr = 0,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'mrr' | 'margin'>('mrr');
  const [hoveredIdx, setHoveredIdx] = useState<number>(data.length - 1);

  const enrichedData = data.map((point, index) => {
    const isLast = index === data.length - 1;
    const adjustedMrr = isLast ? point.mrr + extraCurrentMrr : point.mrr;
    const netMargin = adjustedMrr - point.operatingCosts;
    return {
      ...point,
      mrr: adjustedMrr,
      netMargin,
    };
  });

  const activePoint = enrichedData[hoveredIdx] || enrichedData[enrichedData.length - 1];

  const maxVal = Math.max(
    ...enrichedData.map((d) => Math.max(d.mrr, d.targetMrr)),
    105000
  );
  const minVal = 20000;

  const svgWidth = 760;
  const svgHeight = 230;
  const padLeft = 56;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 34;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const getX = (index: number) =>
    padLeft + (index / Math.max(1, enrichedData.length - 1)) * plotWidth;

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return padTop + plotHeight - ((clamped - minVal) / (maxVal - minVal)) * plotHeight;
  };

  const primaryPoints = enrichedData
    .map((d, i) => `${getX(i)},${getY(selectedMetric === 'mrr' ? d.mrr : d.netMargin)}`)
    .join(' ');

  const secondaryPoints = enrichedData
    .map((d, i) =>
      `${getX(i)},${getY(selectedMetric === 'mrr' ? d.targetMrr : d.operatingCosts)}`
    )
    .join(' ');

  const areaPath =
    enrichedData.length > 1
      ? `M ${getX(0)},${padTop + plotHeight} L ${primaryPoints
          .split(' ')
          .join(' L ')} L ${getX(enrichedData.length - 1)},${padTop + plotHeight} Z`
      : '';

  const yTicks = [30000, 55000, 80000, 100000];

  return (
    <div className="border border-slate-200 bg-white rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            01. Vélocité du Revenu Mensuel Récurrent (MRR) & Trésorerie
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consolidation temps réel des abonnements SEPA et factures Factur-X · Avril à Septembre 2026
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setSelectedMetric('mrr')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedMetric === 'mrr'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            MRR vs Objectif
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('margin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedMetric === 'margin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Excédent vs Charges
          </button>
        </div>
      </div>

      {/* Active Point Readout Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 block">Période sélectionnée</span>
          <span className="font-semibold text-slate-900 mt-0.5 block">
            {activePoint.month}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">
            {selectedMetric === 'mrr' ? 'MRR Encaissé' : 'Excédent Opérationnel'}
          </span>
          <span className="font-mono-tabular font-semibold text-[#1E40AF] text-sm mt-0.5 block">
            {formatCurrency(
              selectedMetric === 'mrr' ? activePoint.mrr : activePoint.netMargin
            )}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">
            {selectedMetric === 'mrr' ? 'Cible Budgétaire' : 'Charges d’Exploitation'}
          </span>
          <span className="font-mono-tabular font-medium text-slate-700 text-sm mt-0.5 block">
            {formatCurrency(
              selectedMetric === 'mrr'
                ? activePoint.targetMrr
                : activePoint.operatingCosts
            )}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Rétention Nette (NRR)</span>
          <span className="font-mono-tabular font-semibold text-emerald-700 text-sm mt-0.5 block">
            {activePoint.netRetention.toFixed(1)} % · +{activePoint.newClients} comptes
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="pt-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 overflow-visible select-none"
          role="img"
          aria-label="Graphique d'évolution du revenu mensuel récurrent"
        >
          <defs>
            <linearGradient id="mrrAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono-tabular"
                >
                  {Math.round(tick / 1000)} k€
                </text>
              </g>
            );
          })}

          {/* Area under primary curve */}
          {areaPath && <path d={areaPath} fill="url(#mrrAreaGrad)" />}

          {/* Secondary Reference Line */}
          <polyline
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            points={secondaryPoints}
          />

          {/* Primary Metric Line */}
          <polyline
            fill="none"
            stroke="#1E40AF"
            strokeWidth="2.5"
            points={primaryPoints}
          />

          {/* Interactive Data Points */}
          {enrichedData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(selectedMetric === 'mrr' ? d.mrr : d.netMargin);
            const isSelected = i === hoveredIdx;

            return (
              <g
                key={d.month}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onClick={() => setHoveredIdx(i)}
              >
                {/* Vertical Hover Guide */}
                {isSelected && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + plotHeight}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                )}

                {/* Invisible larger hit target */}
                <rect
                  x={cx - 28}
                  y={padTop}
                  width={56}
                  height={plotHeight + 24}
                  fill="transparent"
                />

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 5.5 : 3.5}
                  className={
                    isSelected
                      ? 'fill-[#1E40AF] stroke-white stroke-2'
                      : 'fill-white stroke-[#1E40AF] stroke-2'
                  }
                />

                <text
                  x={cx}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-mono-tabular ${
                    isSelected ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {d.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#1E40AF] inline-block" />
              <span>
                {selectedMetric === 'mrr'
                  ? 'MRR Réalisé (HT)'
                  : 'Excédent Opérationnel Net'}
              </span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-0.5 bg-slate-400 inline-block border-b border-dashed border-slate-400" />
              <span>
                {selectedMetric === 'mrr'
                  ? 'Trajectoire Cible'
                  : 'Charges Fixes & Serveurs'}
              </span>
            </span>
          </div>
          <span>Cliquez ou survolez un mois pour inspecter l’arrêté mensuel</span>
        </div>
      </div>
    </div>
  );
};
