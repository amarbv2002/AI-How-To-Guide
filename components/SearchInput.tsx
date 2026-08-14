import React, { useRef, useEffect } from 'react';
import { Search, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { Category } from '../types';

interface SearchInputProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  onClearInput: () => void;
}

const CATEGORIES: Category[] = [
  'All',
  'Technology & Coding',
  'DIY & Home',
  'Culinary & Cooking',
  'Career & Productivity',
  'Creative & Design',
  'Health & Fitness',
];

const SUGGESTED_CHIPS = [
  'bake sourdough bread',
  'tune a bicycle derailleur',
  'create an API with Express',
  'plant microgreens indoors',
  'setup 2-factor authentication',
];

export const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
  selectedCategory,
  onCategoryChange,
  onClearInput,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form && query.trim()) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 scrollbar-none no-print">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25 ring-1 ring-sky-400'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Search Box */}
      <form onSubmit={onSubmit} className="relative group">
        <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 focus-within:border-sky-500/80 focus-within:ring-4 focus-within:ring-sky-500/10 shadow-xl transition-all duration-200 p-2 sm:p-3">
          <div className="flex items-start">
            <div className="pt-2 pl-2 pr-1 flex items-center select-none text-sky-400 font-semibold text-base sm:text-lg flex-shrink-0">
              <span>How to</span>
            </div>

            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="rebuild a carburetor, knit a chunky scarf, deploy a Next.js app..."
              className="w-full bg-transparent text-white placeholder-zinc-500 text-base sm:text-lg focus:outline-none resize-none pt-1.5 px-2 font-normal leading-relaxed min-h-[44px]"
              rows={1}
              disabled={isLoading}
              autoFocus
            />

            <div className="flex items-center space-x-1.5 pt-1 pr-1 flex-shrink-0">
              {query && (
                <button
                  type="button"
                  onClick={onClearInput}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 px-2 border-t border-zinc-800/60 mt-2 text-[11px] text-zinc-500">
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">Enter ↵</kbd> to generate step-by-step instructions</span>
            <span className="sm:hidden">Gemini 3.7 Flash</span>
            <span className="flex items-center gap-1 text-zinc-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Search Grounded
            </span>
          </div>
        </div>
      </form>

      {/* Suggested Quick Searches */}
      {!query && (
        <div className="mt-3 flex items-center flex-wrap gap-1.5 px-1 no-print">
          <span className="text-xs text-zinc-500 mr-1 flex items-center gap-1">
            <Search className="w-3 h-3" /> Try:
          </span>
          {SUGGESTED_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQueryChange(chip)}
              className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-sky-300 transition-colors"
            >
              <span>{chip}</span>
              <ArrowUpRight className="w-3 h-3 ml-1 text-zinc-600 group-hover:text-sky-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
