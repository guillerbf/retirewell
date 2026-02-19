import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import {
  simulateDrawdownCohorts,
  computeDrawdownStats,
  formatCurrency,
  formatPct,
  cohortColor,
} from '../utils/calculations';
import type { Strategy, StrategyParams, WithdrawalMode, DrawdownCohortResult } from '../utils/calculations';

// ─── Shared Controls (reuse pattern from AccumulationTab) ─────

function Slider({
  label, value, min, max, step = 1, fmt, onChange,
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

// ─── Summary Stats ────────────────────────────────────────────

function DrawdownStats({ stats, cohorts }: {
  stats: ReturnType<typeof computeDrawdownStats>;
  cohorts: DrawdownCohortResult[];
}) {
  const rows = [
    {
      label: 'Ruin Rate',
      value: formatPct(stats.ruinRate),
      sub: `${cohorts.filter(c => c.ruined).length} of ${cohorts.length} cohorts ran out of money`,
      color: stats.ruinRate > 0.2 ? 'text-red-400' : stats.ruinRate > 0.05 ? 'text-yellow-400' : 'text-green-400',
    },
    {
      label: 'Best Cohort',
      value: `${stats.bestCohort.startYear}–${stats.bestCohort.endYear}`,
      sub: `${formatCurrency(stats.bestCohort.finalWealth)} remaining`,
      color: 'text-green-400',
    },
    {
      label: 'Worst Cohort',
      value: `${stats.worstCohort.startYear}–${stats.worstCohort.endYear}`,
      sub: stats.worstCohort.ruined
        ? `Ran out in year ${stats.worstCohort.ruinYear! - stats.worstCohort.startYear}`
        : `${formatCurrency(stats.worstCohort.finalWealth)} remaining`,
      color: 'text-red-400',
    },
    {
      label: 'Median Final Wealth',
      value: formatCurrency(stats.medianFinalWealth),
      sub: `Cohort ${stats.medianCohort.startYear}–${stats.medianCohort.endYear}`,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
      <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Summary Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

function SpaghettiChart({ cohorts, stats }: {
  cohorts: DrawdownCohortResult[];
  stats: ReturnType<typeof computeDrawdownStats>;
}) {
  const sorted = useMemo(
    () => [...cohorts].sort((a, b) => a.finalWealth - b.finalWealth),
    [cohorts]
  );
  const N = cohorts[0]?.wealthByYear.length ?? 0;

  const data = useMemo(() => {
    const arr: Record<string, number>[] = [];
    for (let k = 0; k < N; k++) {
      const obj: Record<string, number> = { year: k + 1 };
      for (const c of sorted) {
        obj[String(c.startYear)] = c.wealthByYear[k] ?? 0;
      }
      arr.push(obj);
    }
    return arr;
  }, [sorted, N]);

  const highlighted = new Set([
    String(stats.bestCohort.startYear),
    String(stats.worstCohort.startYear),
    String(stats.medianCohort.startYear),
  ]);

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
      <h3 className="font-semibold text-white mb-1">Portfolio Trajectories — All Cohorts</h3>
      <p className="text-xs text-slate-400 mb-3">
        Each line = one historical retirement start year. Same withdrawal amount, same strategy — different sequences.
        Red lines hit zero (ruin). <span className="text-green-400">Green</span> = best,{' '}
        <span className="text-red-400">red</span> = worst, <span className="text-yellow-400">yellow</span> = median.
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="year"
            tick={TICK_STYLE}
            tickLine={false}
            tickFormatter={v => `Yr ${v}`}
            interval={Math.max(1, Math.floor(N / 6))}
          />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={TICK_STYLE} tickLine={false} width={70} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5} />
          <Tooltip
            formatter={(v: number | undefined, name: string | undefined) => [formatCurrency(v ?? 0), `Start: ${name ?? ''}`]}
            labelFormatter={(l: unknown) => `Year ${l} of retirement`}
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#94a3b8', fontSize: 11 }}
          />
          {sorted.map((c, i) => {
            const key = String(c.startYear);
            const isBest = key === String(stats.bestCohort.startYear);
            const isWorst = key === String(stats.worstCohort.startYear);
            const isMedian = key === String(stats.medianCohort.startYear);
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
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-green-500"></span>Best ({stats.bestCohort.startYear})</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-red-500"></span>Worst ({stats.worstCohort.startYear})</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-yellow-500"></span>Median ({stats.medianCohort.startYear})</span>
      </div>
    </div>
  );
}

function FinalWealthChart({ cohorts, stats }: {
  cohorts: DrawdownCohortResult[];
  stats: ReturnType<typeof computeDrawdownStats>;
}) {
  const data = cohorts.map(c => ({
    year: c.startYear,
    wealth: Math.round(c.finalWealth),
    ruined: c.ruined,
  }));

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
      <h3 className="font-semibold text-white mb-1">Final Wealth by Retirement Start Year</h3>
      <p className="text-xs text-slate-400 mb-3">
        Real portfolio value remaining after the full horizon. <span className="text-red-400">Red bars = portfolio exhausted (ruin)</span>.
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="year" tick={TICK_STYLE} tickLine={false} interval={9} />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={TICK_STYLE} tickLine={false} width={70} />
          <ReferenceLine y={0} stroke="#475569" />
          <Tooltip
            formatter={(v: number | undefined) => [formatCurrency(v ?? 0), 'Final Wealth']}
            labelFormatter={(l: unknown) => `Retirement Start: ${l}`}
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="wealth" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => {
              const isBest = d.year === stats.bestCohort.startYear;
              const isWorst = d.year === stats.worstCohort.startYear;
              const fill = d.ruined ? '#ef4444' : isBest ? '#22c55e' : isWorst ? '#f97316' : '#3b82f6';
              return <Cell key={i} fill={fill} opacity={0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function DrawdownTab() {
  const [startingPortfolio, setStartingPortfolio] = useState(1_000_000);
  const [annualWithdrawal, setAnnualWithdrawal] = useState(40_000);
  const [horizon, setHorizon] = useState(30);
  const [withdrawalMode, setWithdrawalMode] = useState<WithdrawalMode>('fixed');
  const [variableReducePct, setVariableReducePct] = useState(0.15);
  const [variableThresholdPct, setVariableThresholdPct] = useState(0.15);
  const [strategy, setStrategy] = useState<Strategy>('fixed');
  const [equityPct, setEquityPct] = useState(0.4);
  const [startEquityPct, setStartEquityPct] = useState(0.2);
  const [endEquityPct, setEndEquityPct] = useState(0.6);
  const [cashBufferYears, setCashBufferYears] = useState(0);

  const withdrawalRate = startingPortfolio > 0 ? annualWithdrawal / startingPortfolio : 0;

  const strategyParams: StrategyParams = useMemo(() => {
    if (strategy === 'fixed') return { strategy, equityPct };
    if (strategy === 'glidepath') return { strategy, startEquityPct, endEquityPct };
    return { strategy };
  }, [strategy, equityPct, startEquityPct, endEquityPct]);

  const cohorts = useMemo(() => simulateDrawdownCohorts({
    startingPortfolio,
    annualWithdrawal,
    horizon,
    strategy: strategyParams,
    withdrawalMode,
    variableReducePct,
    variableThresholdPct,
    cashBufferYears,
  }), [startingPortfolio, annualWithdrawal, horizon, strategyParams, withdrawalMode,
       variableReducePct, variableThresholdPct, cashBufferYears]);

  const stats = useMemo(() => computeDrawdownStats(cohorts), [cohorts]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
      {/* Controls Panel */}
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 h-fit">
        <h2 className="font-bold text-white text-base mb-4 pb-2 border-b border-slate-600">Parameters</h2>

        <NumberInput label="Starting Portfolio (real $)" value={startingPortfolio}
          prefix="$" onChange={setStartingPortfolio} />
        <NumberInput label="Annual Withdrawal (real $)" value={annualWithdrawal}
          prefix="$" onChange={setAnnualWithdrawal} />
        <div className="text-xs text-slate-400 -mt-1 mb-3">
          Withdrawal rate: <span className={`font-semibold ${withdrawalRate > 0.05 ? 'text-red-400' : withdrawalRate > 0.04 ? 'text-yellow-400' : 'text-green-400'}`}>{formatPct(withdrawalRate)}</span>
          {withdrawalRate > 0.05 && <span className="ml-1 text-red-400">(high risk)</span>}
        </div>

        <Slider label="Retirement Horizon" value={horizon} min={20} max={50} onChange={setHorizon}
          fmt={v => `${v} years`} />

        {/* Withdrawal Mode */}
        <div className="mb-3">
          <div className="text-sm text-slate-300 mb-2">Withdrawal Adjustment</div>
          {(['fixed', 'variable'] as WithdrawalMode[]).map(m => (
            <label key={m} className={`flex items-center gap-2 mb-1.5 cursor-pointer text-sm rounded-lg px-3 py-1.5 transition-colors ${withdrawalMode === m ? 'bg-blue-600/30 text-blue-300' : 'text-slate-300 hover:bg-slate-700'}`}>
              <input type="radio" name="withdrawalMode" value={m} checked={withdrawalMode === m}
                onChange={() => setWithdrawalMode(m)} className="accent-blue-500" />
              {{ fixed: 'Fixed Real (inflation-adjusted)', variable: 'Variable (guardrail cuts)' }[m]}
            </label>
          ))}
        </div>

        {withdrawalMode === 'variable' && (
          <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
            <Slider label="Portfolio Drop Threshold" value={variableThresholdPct}
              min={0.05} max={0.30} step={0.01} onChange={setVariableThresholdPct}
              fmt={v => formatPct(v)} />
            <Slider label="Withdrawal Cut Amount" value={variableReducePct}
              min={0.05} max={0.30} step={0.01} onChange={setVariableReducePct}
              fmt={v => formatPct(v)} />
            <div className="text-xs text-slate-400 mt-1">
              Cut withdrawal by {formatPct(variableReducePct)} whenever portfolio drops more than {formatPct(variableThresholdPct)}
            </div>
          </div>
        )}

        {/* Strategy */}
        <div className="mb-3">
          <div className="text-sm text-slate-300 mb-2">Portfolio Strategy</div>
          {(['sp500', 'bonds', 'fixed', 'glidepath'] as Strategy[]).map(s => (
            <label key={s} className={`flex items-center gap-2 mb-1.5 cursor-pointer text-sm rounded-lg px-3 py-1.5 transition-colors ${strategy === s ? 'bg-blue-600/30 text-blue-300' : 'text-slate-300 hover:bg-slate-700'}`}>
              <input type="radio" name="ddStrategy" value={s} checked={strategy === s}
                onChange={() => setStrategy(s)} className="accent-blue-500" />
              {{ sp500: '100% S&P 500', bonds: '100% Bonds', fixed: 'Fixed Split', glidepath: 'Glide Path (bonds → equity)' }[s]}
            </label>
          ))}
        </div>

        {strategy === 'fixed' && (
          <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
            <Slider label="Equity Allocation" value={equityPct} min={0} max={1} step={0.01}
              onChange={setEquityPct} fmt={v => `${Math.round(v * 100)}% stocks / ${Math.round((1 - v) * 100)}% bonds`} />
          </div>
        )}

        {strategy === 'glidepath' && (
          <div className="bg-slate-700/50 rounded-lg p-3 mb-3 space-y-0">
            <Slider label="Starting Equity (early retirement)" value={startEquityPct}
              min={0} max={0.8} step={0.01} onChange={setStartEquityPct} fmt={v => `${Math.round(v * 100)}%`} />
            <Slider label="Ending Equity (late retirement)" value={endEquityPct}
              min={0.2} max={1} step={0.01} onChange={setEndEquityPct} fmt={v => `${Math.round(v * 100)}%`} />
          </div>
        )}

        {/* Cash Buffer */}
        <div className="mt-2">
          <Slider label="Cash Buffer (years of withdrawals)" value={cashBufferYears}
            min={0} max={5} step={1} onChange={setCashBufferYears}
            fmt={v => v === 0 ? 'None' : `${v} yr${v > 1 ? 's' : ''} (${formatCurrency(v * annualWithdrawal)})`} />
          {cashBufferYears > 0 && (
            <div className="text-xs text-slate-400 -mt-1 mb-2">
              Cash earns T-Bill rate. Buffer is replenished from invested portfolio when it drops below 50%.
            </div>
          )}
        </div>

        <div className="mt-2 bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
          <div>{cohorts.length} historical cohorts simulated</div>
        </div>
      </div>

      {/* Charts + Stats */}
      <div className="space-y-5">
        <DrawdownStats stats={stats} cohorts={cohorts} />
        <SpaghettiChart cohorts={cohorts} stats={stats} />
        <FinalWealthChart cohorts={cohorts} stats={stats} />
      </div>
    </div>
  );
}
