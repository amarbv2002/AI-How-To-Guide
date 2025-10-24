import React, { useState, useEffect } from 'react';
import SearchInput from './components/SearchInput';
import AnswerDisplay from './components/AnswerDisplay';
import { getHowToAnswer } from './services/geminiService';
import { Source } from './types';

const quotes = [
  "The secret of getting ahead is getting started. - Mark Twain",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The best way to predict the future is to create it. - Peter Drucker",
];

const LoadingDisplay = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Set initial quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    // Change quote every 4 seconds
    const intervalId = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 4000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-center text-slate-400 mt-16 animate-fade-in flex flex-col items-center justify-center max-w-2xl mx-auto">
      <svg className="animate-spin h-12 w-12 text-cyan-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {/* Set a fixed height to prevent layout shift when quote changes */}
      <p className="text-lg italic mb-4 h-12 flex items-center justify-center">"{quote}"</p>
      <p className="text-slate-500">Searching for the best answer...</p>
    </div>
  );
}

function App() {
  const [query, setQuery] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const fullPrompt = `How to ${query}`;
    setIsLoading(true);
    setError(null);
    setAnswer('');
    setSources([]);

    try {
      const result = await getHowToAnswer(fullPrompt);
      setAnswer(result.answer);
      setSources(result.sources);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setAnswer('');
    setSources([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
      <header className="text-center my-8 md:my-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            AI How-To Guide
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
          Ask any "how to" question and get instant, intelligent answers powered by AI and web search.
        </p>
      </header>

      <main className="w-full flex-grow flex flex-col items-center px-4">
        <div className="w-full sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md py-2 border-b border-slate-800 shadow-md transition-all duration-300">
          <SearchInput
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSearch}
            isLoading={isLoading}
          />
        </div>
        
        <div className="w-full mt-4">
          {isLoading ? (
            <LoadingDisplay />
          ) : error ? (
            <div className="max-w-3xl mx-auto bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg animate-fade-in" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : answer ? (
            <AnswerDisplay answer={answer} sources={sources} onClear={handleClear} />
          ) : (
             <div className="text-center text-slate-500 mt-16 animate-fade-in">
                <p>Ready to learn something new?</p>
                <p>Type your question above to get started.</p>
             </div>
          )}
        </div>
      </main>
      
      <footer className="w-full text-center p-4 mt-12 text-slate-500 text-sm space-y-2">
        <p>
          Made with ❤️ by <a href="https://amarkarthik.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Amar Karthik</a></p>
        <p>&copy; {new Date().getFullYear()} AI How-To Guide. All Rights Reserved.</p>
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
}

export default App;
