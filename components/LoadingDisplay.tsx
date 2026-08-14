import React, { useState, useEffect } from 'react';
import { Search, Cpu, CheckCircle2, Sparkles } from 'lucide-react';

const LOADING_STEPS = [
  { text: 'Engaging Gemini 3.7 Flash model', icon: Cpu },
  { text: 'Querying live Google Search index for latest methods', icon: Search },
  { text: 'Synthesizing verified step-by-step instructions', icon: Sparkles },
  { text: 'Extracting safety tips & grounding citations', icon: CheckCircle2 },
];

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Knowledge is of no value unless you put it into practice. — Anton Chekhov",
  "Action is the foundational key to all success. — Pablo Picasso",
  "Simplicity is the prerequisite for reliability. — Edsger W. Dijkstra",
];

export const LoadingDisplay: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    const quoteInterval = setInterval(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 4500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
      {/* Animated Orb */}
      <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">Generating Step-by-Step Blueprint</h3>
      
      {/* Step stages */}
      <div className="w-full space-y-2.5 my-6 text-left">
        {LOADING_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          return (
            <div
              key={idx}
              className={`flex items-center space-x-3 p-2.5 rounded-lg text-xs transition-all duration-300 ${
                isCurrent
                  ? 'bg-sky-500/10 border border-sky-500/30 text-sky-200'
                  : isDone
                  ? 'bg-zinc-800/40 text-emerald-300 border border-transparent'
                  : 'text-zinc-600'
              }`}
            >
              <div className="flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-zinc-600" />
                )}
              </div>
              <span className="font-medium">{step.text}</span>
            </div>
          );
        })}
      </div>

      {/* Quote */}
      <div className="pt-4 border-t border-zinc-800 w-full text-zinc-400 text-xs italic">
        "{quote}"
      </div>
    </div>
  );
};

export default LoadingDisplay;
