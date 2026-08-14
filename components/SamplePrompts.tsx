import React from 'react';
import { Code, Wrench, Utensils, Briefcase, Palette, HeartPulse, ArrowRight } from 'lucide-react';
import { Category } from '../types';

interface SamplePromptsProps {
  onSelectPrompt: (query: string, category?: Category) => void;
}

interface PromptCard {
  category: Category;
  title: string;
  query: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  timeEstimate: string;
}

const SAMPLE_PROMPTS: PromptCard[] = [
  {
    category: 'Technology & Coding',
    title: 'Master Git Interactive Rebase',
    query: 'use git interactive rebase to squash and clean up git commit history safely',
    icon: Code,
    accentColor: 'from-blue-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30',
    timeEstimate: '10 mins',
  },
  {
    category: 'DIY & Home',
    title: 'Fix a Dripping Bathroom Faucet',
    query: 'fix a leaky ceramic disc cartridge bathroom faucet step by step',
    icon: Wrench,
    accentColor: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    timeEstimate: '30 mins',
  },
  {
    category: 'Culinary & Cooking',
    title: 'Brew Barista-Grade V60 Pour-Over',
    query: 'brew the perfect cup of coffee using a Hario V60 pour over method with ratio and grind size',
    icon: Utensils,
    accentColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    timeEstimate: '5 mins',
  },
  {
    category: 'Career & Productivity',
    title: 'Run a High-Impact Sprint Retrospective',
    query: 'facilitate an engaging agile sprint retrospective that produces actionable outcomes',
    icon: Briefcase,
    accentColor: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    timeEstimate: '45 mins',
  },
  {
    category: 'Creative & Design',
    title: 'Create a High-Contrast Color Palette',
    query: 'build an accessible WCAG AAA compliant color system for a design system',
    icon: Palette,
    accentColor: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
    timeEstimate: '15 mins',
  },
  {
    category: 'Health & Fitness',
    title: 'Set Up an Ergonomic Desk Station',
    query: 'configure desk chair and dual monitor height to eliminate neck and lower back pain',
    icon: HeartPulse,
    accentColor: 'from-teal-500/20 to-green-500/20 text-teal-400 border-teal-500/30',
    timeEstimate: '20 mins',
  },
];

export const SamplePrompts: React.FC<SamplePromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Popular How-To Guides
          </h3>
          <p className="text-xs text-zinc-500">Instant step-by-step blueprints grounded with Google search</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {SAMPLE_PROMPTS.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt.query, prompt.category)}
              className="group text-left p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${prompt.accentColor} border`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
                  {prompt.timeEstimate}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">
                  {prompt.category}
                </span>
                <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                  {prompt.title}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <span className="truncate pr-2">How to {prompt.query.slice(0, 30)}...</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SamplePrompts;
