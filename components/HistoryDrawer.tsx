import React from 'react';
import { History, X, Star, Trash2, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectQuery: (query: string, category?: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onToggleFavorite,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Search History</h3>
                <p className="text-xs text-zinc-400">
                  {history.length} saved {history.length === 1 ? 'guide' : 'guides'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No recent how-to searches yet.</p>
                <p className="text-xs mt-1 text-zinc-600">Your search queries will appear here automatically.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="group relative p-3.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectQuery(item.query, item.category);
                        onClose();
                      }}
                      className="text-left flex-1"
                    >
                      {item.category && item.category !== 'All' && (
                        <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 inline-block mb-1">
                          {item.category}
                        </span>
                      )}
                      <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors line-clamp-2">
                        How to {item.query}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.timestamp)}
                        {item.sourcesCount > 0 && ` • ${item.sourcesCount} sources`}
                      </p>
                    </button>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.favorite
                            ? 'text-amber-400 bg-amber-400/10'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                        title={item.favorite ? 'Favorited' : 'Add to favorites'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-950/50">
              <button
                type="button"
                onClick={onClearAllHistory}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>

              <span className="text-[11px] text-zinc-500">Stored locally in browser</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;
