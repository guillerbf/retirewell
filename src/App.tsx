import { useState } from 'react';
import { AccumulationTab } from './components/AccumulationTab';
import { DrawdownTab } from './components/DrawdownTab';

type Tab = 'accumulation' | 'drawdown';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('accumulation');

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Sequencing Risk Explorer
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Real historical data &nbsp;·&nbsp; 1928–2024 &nbsp;·&nbsp; All returns are inflation-adjusted
              </p>
            </div>
            {/* Tab switcher */}
            <div className="flex bg-slate-800 border border-slate-600 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('accumulation')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'accumulation'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Building Wealth
              </button>
              <button
                onClick={() => setActiveTab('drawdown')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'drawdown'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Retirement Spending
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Concept Banner */}
      <div className="bg-blue-950/40 border-b border-blue-900/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3">
          {activeTab === 'accumulation' ? (
            <p className="text-sm text-blue-300">
              <span className="font-semibold text-blue-200">Accumulation phase:</span>{' '}
              Two investors with identical contributions and the same strategy can end up with wildly
              different retirement savings depending purely on which years they lived through.
              That's sequencing risk.
            </p>
          ) : (
            <p className="text-sm text-blue-300">
              <span className="font-semibold text-blue-200">Drawdown phase:</span>{' '}
              Retiring into a bad market early in retirement is far more damaging than late-career losses.
              A crash in year 2 of retirement can destroy a portfolio that would have survived the same
              crash in year 20.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'accumulation' ? <AccumulationTab /> : <DrawdownTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-500">
            <div className="space-y-1">
              <p>
                Data:{' '}
                <a
                  href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Aswath Damodaran, NYU Stern — Historical Returns on Stocks, Bonds and Bills
                </a>
              </p>
              <p>
                S&amp;P 500 total returns (nominal) &nbsp;·&nbsp; 10-year T-Bond returns &nbsp;·&nbsp; 3-month T-Bill rate &nbsp;·&nbsp; CPI inflation.
                Real returns computed as{' '}
                <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded text-xs">
                  (1 + nominal) / (1 + CPI) − 1
                </code>
              </p>
            </div>
            <div className="text-xs text-slate-600 shrink-0">
              All values in real (inflation-adjusted) terms unless noted.
              Past returns do not guarantee future results.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
