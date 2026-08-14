import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import AnswerDisplay from './components/AnswerDisplay';
import LoadingDisplay from './components/LoadingDisplay';
import SamplePrompts from './components/SamplePrompts';
import HistoryDrawer from './components/HistoryDrawer';
import { getHowToAnswer } from './services/geminiService';
import { Source, Category, HistoryItem } from './types';
import { AlertCircle, RotateCcw, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ai_howto_history_v1';

export function App() {
  const [query, setQuery] = useState<string>('');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [answer, setAnswer] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
  }, [history]);

  const executeSearch = async (searchPrompt: string, category: Category = selectedCategory) => {
    const trimmed = searchPrompt.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer('');
    setSources([]);
    setActiveSearchQuery(trimmed);

    try {
      const fullPrompt = `How to ${trimmed}`;
      const result = await getHowToAnswer(fullPrompt, category !== 'All' ? category : undefined);

      setAnswer(result.answer);
      setSources(result.sources);

      // Save to history
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        query: trimmed,
        timestamp: Date.now(),
        category: category !== 'All' ? category : undefined,
        sourcesCount: result.sources.length,
        previewText: result.answer.slice(0, 120),
        favorite: false,
      };

      setHistory((prev) => [
        newHistoryItem,
        ...prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 30));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while communicating with Gemini.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeSearch(query, selectedCategory);
  };

  const handleSelectSamplePrompt = (sampleQuery: string, category?: Category) => {
    setQuery(sampleQuery);
    if (category) {
      setSelectedCategory(category);
    }
    executeSearch(sampleQuery, category || selectedCategory);
  };

  const handleFollowUp = (followUpPrompt: string) => {
    setQuery(followUpPrompt);
    executeSearch(followUpPrompt, selectedCategory);
  };

  const handleClear = () => {
    setAnswer('');
    setSources([]);
    setError(null);
    setActiveSearchQuery('');
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
    );
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-sky-500/20 selection:text-sky-200">
      {/* App Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center">
        {/* Hero Section (only prominent when no answer is active) */}
        {!answer && !isLoading && !error && (
          <div className="text-center my-6 md:my-10 max-w-2xl mx-auto no-print">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Next-Gen Instruction Engine • Gemini 3.7 Flash</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Learn how to do <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                virtually anything.
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
              Get instant, verifiable, step-by-step blueprints grounded with real-time web citations and structured checklists.
            </p>
          </div>
        )}

        {/* Sticky/Prominent Search Bar */}
        <div className="w-full sticky top-0 z-20 py-2 backdrop-blur-md bg-zinc-950/80 transition-all duration-200">
          <SearchInput
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSearchSubmit}
            isLoading={isLoading}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onClearInput={() => setQuery('')}
          />
        </div>

        {/* Content Views */}
        <div className="w-full mt-2 flex-1">
          {isLoading ? (
            <LoadingDisplay />
          ) : error ? (
            <div className="max-w-2xl mx-auto my-8 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-2xl">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-white mb-1">
                    {error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('quota')
                      ? 'Gemini API Rate Limit / Quota Notice'
                      : 'Unable to Generate Guide'}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                    {error}
                  </p>

                  <div className="flex items-center flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => executeSearch(query || activeSearchQuery, selectedCategory)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setAnswer('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : answer ? (
            <AnswerDisplay
              query={activeSearchQuery}
              answer={answer}
              sources={sources}
              onClear={handleClear}
              onFollowUp={handleFollowUp}
            />
          ) : (
            <SamplePrompts onSelectPrompt={handleSelectSamplePrompt} />
          )}
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectQuery={(q, cat) => {
          setQuery(q);
          if (cat) setSelectedCategory(cat as Category);
          executeSearch(q, (cat as Category) || 'All');
        }}
        onToggleFavorite={handleToggleFavorite}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Modern Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-6 px-4 text-center text-xs text-zinc-500 space-y-1.5 no-print mt-12 bg-zinc-950/60">
        <p className="flex items-center justify-center gap-1.5">
          <span>AI How-To Guide</span>
          <span>•</span>
          <span>Powered by Google Gemini 3.7 Flash & Google Search</span>
        </p>
        <p className="text-zinc-600 text-[11px]">
          Created with precision for reliable step-by-step practical knowledge
        </p>
      </footer>
    </div>
  );
}

export default App;
