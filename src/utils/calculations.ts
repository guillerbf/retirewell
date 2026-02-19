import { historicalReturns, realReturn } from '../data/historicalReturns';

export type Strategy = 'sp500' | 'bonds' | 'glidepath' | 'fixed';

export interface StrategyParams {
  strategy: Strategy;
  equityPct?: number;          // for fixed split
  startEquityPct?: number;     // for glide path
  endEquityPct?: number;       // for glide path
}

/** Compute the portfolio return for a given year and allocation */
function portfolioReturn(
  yearIndex: number,
  equityAlloc: number,
  bondAlloc: number
): number {
  const d = historicalReturns[yearIndex];
  const eq = realReturn(d.sp500, d.cpi);
  const bo = realReturn(d.tbond, d.cpi);
  return equityAlloc * eq + bondAlloc * bo;
}

/** Compute the cash (T-Bill) real return for a given year */
function cashReturn(yearIndex: number): number {
  const d = historicalReturns[yearIndex];
  return realReturn(d.tbill, d.cpi);
}

/** Get equity allocation for a given year k out of N total years (glide path) */
function glideEquity(
  k: number,
  n: number,
  startEquityPct: number,
  endEquityPct: number
): number {
  if (n <= 1) return endEquityPct;
  return startEquityPct + (endEquityPct - startEquityPct) * (k / (n - 1));
}

// ─────────────────────────────────────────────────────────────
// ACCUMULATION PHASE
// ─────────────────────────────────────────────────────────────

export interface AccumulationParams {
  yearsToRetirement: number;        // retirement_age - start_age
  annualContribution: number;       // Year 1 contribution (real dollars)
  contributionGrowthRate: number;   // real annual growth rate of contributions
  strategy: StrategyParams;
}

export interface CohortResult {
  startYear: number;
  retirementYear: number;
  terminalWealth: number;           // real terminal portfolio value
  annualizedRealReturn: number;
  wealthByYear: number[];           // wealth at end of each year (real)
}

export function simulateAccumulationCohorts(
  params: AccumulationParams
): CohortResult[] {
  const { yearsToRetirement: N, annualContribution, contributionGrowthRate, strategy } = params;
  const results: CohortResult[] = [];
  const maxIndex = historicalReturns.length;

  for (let startIdx = 0; startIdx + N <= maxIndex; startIdx++) {
    const startYear = historicalReturns[startIdx].year;
    let portfolio = 0;
    const wealthByYear: number[] = [];

    for (let k = 0; k < N; k++) {
      const yearIdx = startIdx + k;
      // Contribution grows in real terms each year
      const contribution = annualContribution * Math.pow(1 + contributionGrowthRate, k);
      // Contribute at start of year
      portfolio += contribution;

      // Apply return
      let ret: number;
      if (strategy.strategy === 'sp500') {
        ret = realReturn(historicalReturns[yearIdx].sp500, historicalReturns[yearIdx].cpi);
      } else if (strategy.strategy === 'bonds') {
        ret = realReturn(historicalReturns[yearIdx].tbond, historicalReturns[yearIdx].cpi);
      } else if (strategy.strategy === 'fixed') {
        const eq = strategy.equityPct ?? 0.6;
        const bo = 1 - eq;
        ret = portfolioReturn(yearIdx, eq, bo);
      } else {
        // glide path
        const startEq = strategy.startEquityPct ?? 0.9;
        const endEq = strategy.endEquityPct ?? 0.2;
        const eq = glideEquity(k, N, startEq, endEq);
        ret = portfolioReturn(yearIdx, eq, 1 - eq);
      }

      portfolio *= (1 + ret);
      wealthByYear.push(portfolio);
    }

    const terminalWealth = portfolio;
    // Annualized real return: (terminalWealth / totalContributions_if_no_return)^(1/N) - 1
    // Simpler: CAGR of portfolio assuming single lump sum equivalent
    // We'll compute it as the IRR-equivalent: growth of $1 invested at t=0
    // For display, use geometric mean of annual returns instead
    const geoMeanReturn = Math.pow(terminalWealth / (annualContribution * N), 1 / N) - 1;

    results.push({
      startYear,
      retirementYear: startYear + N,
      terminalWealth,
      annualizedRealReturn: geoMeanReturn,
      wealthByYear,
    });
  }

  return results;
}

export interface AccumulationStats {
  best: CohortResult;
  worst: CohortResult;
  median: CohortResult;
  mean: number;
  stdDev: number;
  ratio: number; // best / worst
}

export function computeAccumulationStats(cohorts: CohortResult[]): AccumulationStats {
  const sorted = [...cohorts].sort((a, b) => a.terminalWealth - b.terminalWealth);
  const best = sorted[sorted.length - 1];
  const worst = sorted[0];
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = sorted.reduce((s, c) => s + c.terminalWealth, 0) / sorted.length;
  const variance = sorted.reduce((s, c) => s + (c.terminalWealth - mean) ** 2, 0) / sorted.length;
  const stdDev = Math.sqrt(variance);
  return { best, worst, median, mean, stdDev, ratio: worst.terminalWealth > 0 ? best.terminalWealth / worst.terminalWealth : Infinity };
}

// ─────────────────────────────────────────────────────────────
// DRAWDOWN PHASE
// ─────────────────────────────────────────────────────────────

export type WithdrawalMode = 'fixed' | 'variable';

export interface DrawdownParams {
  startingPortfolio: number;
  annualWithdrawal: number;
  horizon: number;               // years
  strategy: StrategyParams;
  withdrawalMode: WithdrawalMode;
  variableReducePct?: number;    // reduce withdrawal by X% if portfolio drops >Y%
  variableThresholdPct?: number; // portfolio drop threshold (Y%)
  cashBufferYears?: number;      // 0 = no buffer
}

export interface DrawdownCohortResult {
  startYear: number;
  endYear: number;
  finalWealth: number;           // real final portfolio value (0 if ruined)
  ruined: boolean;
  ruinYear?: number;
  wealthByYear: number[];        // real portfolio value at end of each year
  withdrawalByYear: number[];    // actual withdrawal taken each year
}

export function simulateDrawdownCohorts(
  params: DrawdownParams
): DrawdownCohortResult[] {
  const {
    startingPortfolio,
    annualWithdrawal,
    horizon: N,
    strategy,
    withdrawalMode,
    variableReducePct = 0.15,
    variableThresholdPct = 0.15,
    cashBufferYears = 0,
  } = params;
  const results: DrawdownCohortResult[] = [];
  const maxIndex = historicalReturns.length;

  for (let startIdx = 0; startIdx + N <= maxIndex; startIdx++) {
    const startYear = historicalReturns[startIdx].year;
    let portfolio = startingPortfolio;
    let cashBuffer = cashBufferYears * annualWithdrawal;
    let investedPortfolio = portfolio - cashBuffer;
    let ruined = false;
    let ruinYear: number | undefined;
    const wealthByYear: number[] = [];
    const withdrawalByYear: number[] = [];
    let currentWithdrawal = annualWithdrawal;
    let prevPortfolioValue = portfolio;

    for (let k = 0; k < N; k++) {
      const yearIdx = startIdx + k;
      const totalPortfolio = investedPortfolio + cashBuffer;

      if (totalPortfolio <= 0) {
        ruined = true;
        if (!ruinYear) ruinYear = startYear + k;
        wealthByYear.push(0);
        withdrawalByYear.push(0);
        continue;
      }

      // Variable withdrawal adjustment
      if (withdrawalMode === 'variable' && k > 0) {
        const drawdown = (prevPortfolioValue - totalPortfolio) / prevPortfolioValue;
        if (drawdown > variableThresholdPct) {
          currentWithdrawal *= (1 - variableReducePct);
        }
      }
      prevPortfolioValue = totalPortfolio;

      // Take withdrawal
      let withdrawal = Math.min(currentWithdrawal, totalPortfolio);
      if (cashBufferYears > 0) {
        const fromCash = Math.min(withdrawal, cashBuffer);
        cashBuffer -= fromCash;
        const fromInvested = withdrawal - fromCash;
        investedPortfolio = Math.max(0, investedPortfolio - fromInvested);
      } else {
        investedPortfolio = Math.max(0, investedPortfolio - withdrawal);
      }

      withdrawalByYear.push(withdrawal);

      // Apply investment return to invested portion
      let ret: number;
      if (strategy.strategy === 'sp500') {
        ret = realReturn(historicalReturns[yearIdx].sp500, historicalReturns[yearIdx].cpi);
      } else if (strategy.strategy === 'bonds') {
        ret = realReturn(historicalReturns[yearIdx].tbond, historicalReturns[yearIdx].cpi);
      } else if (strategy.strategy === 'fixed') {
        const eq = strategy.equityPct ?? 0.2;
        const bo = 1 - eq;
        ret = portfolioReturn(yearIdx, eq, bo);
      } else {
        // reverse glide path (bonds -> equities)
        const startEq = strategy.startEquityPct ?? 0.2;
        const endEq = strategy.endEquityPct ?? 0.6;
        const eq = glideEquity(k, N, startEq, endEq);
        ret = portfolioReturn(yearIdx, eq, 1 - eq);
      }
      investedPortfolio *= (1 + ret);

      // Cash buffer earns T-bill rate
      if (cashBufferYears > 0) {
        const cashRet = cashReturn(yearIdx);
        cashBuffer *= (1 + cashRet);
        // Replenish cash buffer if invested is large enough
        const targetCash = cashBufferYears * annualWithdrawal;
        if (cashBuffer < targetCash * 0.5 && investedPortfolio > targetCash) {
          const topUp = Math.min(targetCash - cashBuffer, investedPortfolio * 0.2);
          cashBuffer += topUp;
          investedPortfolio -= topUp;
        }
      }

      const totalEnd = investedPortfolio + cashBuffer;
      wealthByYear.push(Math.max(0, totalEnd));
      if (totalEnd <= 0 && !ruined) {
        ruined = true;
        ruinYear = startYear + k + 1;
      }
    }

    results.push({
      startYear,
      endYear: startYear + N,
      finalWealth: Math.max(0, investedPortfolio + cashBuffer),
      ruined,
      ruinYear,
      wealthByYear,
      withdrawalByYear,
    });
  }

  return results;
}

export interface DrawdownStats {
  ruinRate: number;
  medianFinalWealth: number;
  worstCohort: DrawdownCohortResult;
  bestCohort: DrawdownCohortResult;
  medianCohort: DrawdownCohortResult;
}

export function computeDrawdownStats(cohorts: DrawdownCohortResult[]): DrawdownStats {
  const ruinCount = cohorts.filter(c => c.ruined).length;
  const sorted = [...cohorts].sort((a, b) => a.finalWealth - b.finalWealth);
  return {
    ruinRate: ruinCount / cohorts.length,
    medianFinalWealth: sorted[Math.floor(sorted.length / 2)].finalWealth,
    worstCohort: sorted[0],
    bestCohort: sorted[sorted.length - 1],
    medianCohort: sorted[Math.floor(sorted.length / 2)],
  };
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(2) + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return '$' + (value / 1_000).toFixed(1) + 'K';
  }
  return '$' + value.toFixed(0);
}

export function formatPct(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

/** Assign a color from red (0) to green (1) for spaghetti lines */
export function cohortColor(rank: number, total: number): string {
  const t = total <= 1 ? 0.5 : rank / (total - 1);
  // Red (bad) → Yellow (mid) → Green (good)
  if (t < 0.5) {
    const r = 220;
    const g = Math.round(t * 2 * 220);
    return `rgb(${r},${g},50)`;
  } else {
    const r = Math.round((1 - t) * 2 * 220);
    const g = 200;
    return `rgb(${r},${g},50)`;
  }
}
