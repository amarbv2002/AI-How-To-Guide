import React from 'react';
import { Sparkles, Globe, History, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory, historyCount }) => {
  return (
    <header className="w-full max-w-5xl mx-auto pt-6 pb-4 px-4 flex items-center justify-between no-print">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AI How-To Guide
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Gemini 3.7 Flash
            </span>
          </div>
          <p className="text-xs text-zinc-400">Step-by-step verified instructions & web search</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Search Grounded</span>
        </div>

        <button
          onClick={onOpenHistory}
          className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-medium"
          title="View Search History"
        >
          <History className="w-3.5 h-3.5 text-zinc-400" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
