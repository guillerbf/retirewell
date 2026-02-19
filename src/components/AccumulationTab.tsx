import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import {
  simulateAccumulationCohorts,
  computeAccumulationStats,
  formatCurrency,
  formatPct,
  cohortColor,
} from '../utils/calculations';
import type { Strategy, StrategyParams, CohortResult } from '../utils/calculations';

// ─── Controls ────────────────────────────────────────────────

function Slider({
  label, value, min, max, step = 1, fmt,
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  fmt: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-blue-300">{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg accent-blue-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-0.5">
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </div>
  );
}

function NumberInput({
  label, value, prefix = '', onChange,
}: {
  label: string; value: number; prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      <div className="flex items-center bg-slate-700 rounded-lg overflow-hidden border border-slate-600 focus-within:border-blue-500">
        {prefix && <span className="px-3 text-slate-400 text-sm">{prefix}</span>}
        <input
          type="number" value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent px-3 py-2 text-white text-sm outline-none"
        />
      </div>
    </div>
  );
}

// ─── Summary Stats Box ────────────────────────────────────────

function SummaryStats({ stats }: { stats: ReturnType<typeof computeAccumulationStats> }) {
  const rows = [
    { label: 'Best Cohort', value: `${stats.best.startYear}–${stats.best.retirementYear}`, sub: `${formatCurrency(stats.best.terminalWealth)} terminal wealth`, color: 'text-green-400' },
    { label: 'Worst Cohort', value: `${stats.worst.startYear}–${stats.worst.retirementYear}`, sub: `${formatCurrency(stats.worst.terminalWealth)} terminal wealth`, color: 'text-red-400' },
    { label: 'Median Cohort', value: `${stats.median.startYear}–${stats.median.retirementYear}`, sub: `${formatCurrency(stats.median.terminalWealth)} terminal wealth`, color: 'text-yellow-400' },
    { label: 'Best/Worst Ratio', value: stats.ratio === Infinity ? '∞' : stats.ratio.toFixed(1) + '×', sub: 'luck multiplier', color: 'text-blue-400' },
    { label: 'Std Deviation', value: formatCurrency(stats.stdDev), sub: 'spread of outcomes', color: 'text-purple-400' },
  ];
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
      <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Summary Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(r => (
          <div key={r.label} className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-0.5">{r.label}</div>
            <div className={`font-bold text-lg ${r.color}`}>{r.value}</div>
            <div className="text-xs text-slate-400">{r.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────

const TICK_STYLE = { fill: '#94a3b8', fontSize: 11 };

function TerminalWealthChart({ cohorts, stats }: {
  cohorts: CohortResult[];
  stats: ReturnType<typeof computeAccumulationStats>;
}) {
  const data = cohorts.map(c => ({
    year: c.startYear,
    wealth: Math.round(c.terminalWealth),
    isBest: c.startYear === stats.best.startYear,
    isWorst: c.startYear === stats.worst.startYear,
  }));

  const CustomBar = (props: any) => {
    const { x, y, width, height, year } = props;
    const isBest = year === stats.best.startYear;
    const isWorst = year === stats.worst.startYear;
    const fill = isBest ? '#22c55e' : isWorst ? '#ef4444' : '#3b82f6';
    return <rect x={x} y={y} width={width} height={height} fill={fill} opacity={0.85} rx={1} />;
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
      <h3 className="font-semibold text-white mb-1">Terminal Real Wealth by Start Year</h3>
      <p className="text-xs text-slate-400 mb-3">
        Real portfolio value at retirement for each historical cohort. <span className="text-green-400">Green</span> = best, <span className="text-red-400">red</span> = worst.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="year" tick={TICK_STYLE} tickLine={false} interval={9} />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={TICK_STYLE} tickLine={false} width={70} />
          <Tooltip
            formatter={(v: number | undefined) => [formatCurrency(v ?? 0), 'Terminal Wealth']}
            labelFormatter={(l: unknown) => `Start Year: ${l}`}
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="wealth" shape={<CustomBar />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SpaghettiChart({ cohorts, stats }: {
  cohorts: CohortResult[];
  stats: ReturnType<typeof computeAccumulationStats>;
}) {
  const sorted = useMemo(() => [...cohorts].sort((a, b) => a.terminalWealth - b.terminalWealth), [cohorts]);
  const N = cohorts[0]?.wealthByYear.length ?? 0;

  // Build data: one object per year-step, with each cohort as a key
  const data = useMemo(() => {
    const arr: Record<string, number>[] = [];
    for (let k = 0; k < N; k++) {
      const obj: Record<string, number> = { year: k };
      for (const c of sorted) {
        obj[String(c.startYear)] = c.wealthByYear[k] ?? 0;
      }
      arr.push(obj);
    }
    return arr;
  }, [sorted, N]);

  const highlighted = new Set([
    String(stats.best.startYear),
    String(stats.worst.startYear),
    String(stats.median.startYear),
  ]);

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
      <h3 className="font-semibold text-white mb-1">Wealth Trajectories — All Cohorts</h3>
      <p className="text-xs text-slate-400 mb-3">
        Each line = one historical start year. Same contributions, same strategy — different sequences of returns.
        <span className="text-green-400 ml-1">Green</span> = best,{' '}
        <span className="text-red-400">red</span> = worst,{' '}
        <span className="text-yellow-400">yellow</span> = median.
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="year"
            tick={TICK_STYLE}
            tickLine={false}
            tickFormatter={v => `Yr ${v + 1}`}
            interval={Math.floor(N / 6)}
          />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={TICK_STYLE} tickLine={false} width={70} />
          <Tooltip
            formatter={(v: number | undefined, name: string | undefined) => [formatCurrency(v ?? 0), `Start: ${name ?? ''}`]}
            labelFormatter={(l: unknown) => `Year ${Number(l) + 1}`}
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#94a3b8', fontSize: 11 }}
          />
          {sorted.map((c, i) => {
            const key = String(c.startYear);
            const isBest = key === String(stats.best.startYear);
            const isWorst = key === String(stats.worst.startYear);
            const isMedian = key === String(stats.median.startYear);
            const isHighlighted = highlighted.has(key);
            const color = isBest ? '#22c55e' : isWorst ? '#ef4444' : isMedian ? '#eab308' : cohortColor(i, sorted.length);
            return (
              <Line
                key={key}
                dataKey={key}
                stroke={color}
                strokeWidth={isHighlighted ? 2.5 : 0.8}
                dot={false}
                opacity={isHighlighted ? 1 : 0.35}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-green-500"></span>Best ({stats.best.startYear})</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-red-500"></span>Worst ({stats.worst.startYear})</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-yellow-500"></span>Median ({stats.median.startYear})</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function AccumulationTab() {
  const [startAge, setStartAge] = useState(22);
  const [retirementAge, setRetirementAge] = useState(68);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [contributionGrowth, setContributionGrowth] = useState(0.01);
  const [strategy, setStrategy] = useState<Strategy>('glidepath');
  const [equityPct, setEquityPct] = useState(0.6);
  const [startEquityPct, setStartEquityPct] = useState(0.9);
  const [endEquityPct, setEndEquityPct] = useState(0.2);

  const yearsToRetirement = Math.max(1, retirementAge - startAge);

  const strategyParams: StrategyParams = useMemo(() => {
    if (strategy === 'fixed') return { strategy, equityPct };
    if (strategy === 'glidepath') return { strategy, startEquityPct, endEquityPct };
    return { strategy };
  }, [strategy, equityPct, startEquityPct, endEquityPct]);

  const cohorts = useMemo(() => simulateAccumulationCohorts({
    yearsToRetirement,
    annualContribution,
    contributionGrowthRate: contributionGrowth,
    strategy: strategyParams,
  }), [yearsToRetirement, annualContribution, contributionGrowth, strategyParams]);

  const stats = useMemo(() => computeAccumulationStats(cohorts), [cohorts]);

  const strategyLabel = {
    sp500: '100% S&P 500',
    bonds: '100% Bonds',
    fixed: `${Math.round(equityPct * 100)}/${Math.round((1 - equityPct) * 100)} Stocks/Bonds`,
    glidepath: `Glide Path (${Math.round(startEquityPct * 100)}% → ${Math.round(endEquityPct * 100)}% equity)`,
  }[strategy];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
      {/* Controls Panel */}
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 h-fit">
        <h2 className="font-bold text-white text-base mb-4 pb-2 border-b border-slate-600">Parameters</h2>

        <Slider label="Start Age" value={startAge} min={18} max={40} onChange={setStartAge}
          fmt={v => `${v} yrs`} />
        <Slider label="Retirement Age" value={retirementAge} min={55} max={75}
          onChange={v => setRetirementAge(Math.max(v, startAge + 1))} fmt={v => `${v} yrs`} />
        <div className="text-xs text-slate-400 -mt-1 mb-3">Saving period: {yearsToRetirement} years</div>

        <NumberInput label="Year 1 Contribution (real $)" value={annualContribution}
          prefix="$" onChange={setAnnualContribution} />
        <Slider label="Contribution Growth (real)" value={contributionGrowth}
          min={0} max={0.03} step={0.001} onChange={setContributionGrowth}
          fmt={v => formatPct(v)} />

        <div className="mt-2 mb-3">
          <div className="text-sm text-slate-300 mb-2">Strategy</div>
          {(['sp500', 'bonds', 'fixed', 'glidepath'] as Strategy[]).map(s => (
            <label key={s} className={`flex items-center gap-2 mb-1.5 cursor-pointer text-sm rounded-lg px-3 py-1.5 transition-colors ${strategy === s ? 'bg-blue-600/30 text-blue-300' : 'text-slate-300 hover:bg-slate-700'}`}>
              <input type="radio" name="strategy" value={s} checked={strategy === s}
                onChange={() => setStrategy(s)} className="accent-blue-500" />
              {{ sp500: '100% S&P 500', bonds: '100% Bonds', fixed: 'Fixed Split', glidepath: 'Glide Path' }[s]}
            </label>
          ))}
        </div>

        {strategy === 'fixed' && (
          <div className="bg-slate-700/50 rounded-lg p-3 mt-2">
            <Slider label="Equity Allocation" value={equityPct} min={0} max={1} step={0.01}
              onChange={setEquityPct} fmt={v => `${Math.round(v * 100)}% stocks / ${Math.round((1 - v) * 100)}% bonds`} />
          </div>
        )}

        {strategy === 'glidepath' && (
          <div className="bg-slate-700/50 rounded-lg p-3 mt-2 space-y-0">
            <Slider label="Starting Equity (at start age)" value={startEquityPct}
              min={0.5} max={1} step={0.01} onChange={setStartEquityPct}
              fmt={v => `${Math.round(v * 100)}%`} />
            <Slider label="Ending Equity (at retirement)" value={endEquityPct}
              min={0} max={0.5} step={0.01} onChange={setEndEquityPct}
              fmt={v => `${Math.round(v * 100)}%`} />
          </div>
        )}

        <div className="mt-4 bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Active strategy</div>
          <div>{strategyLabel}</div>
          <div className="mt-1">{cohorts.length} historical cohorts simulated</div>
        </div>
      </div>

      {/* Charts + Stats */}
      <div className="space-y-5">
        <SummaryStats stats={stats} />
        <TerminalWealthChart cohorts={cohorts} stats={stats} />
        <SpaghettiChart cohorts={cohorts} stats={stats} />
      </div>
    </div>
  );
}
