import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Printer,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Globe,
  Trash2,
} from 'lucide-react';
import { Source } from '../types';

interface AnswerDisplayProps {
  query: string;
  answer: string;
  sources: Source[];
  onClear: () => void;
  onFollowUp?: (question: string) => void;
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  query,
  answer,
  sources,
  onClear,
  onFollowUp,
}) => {
  const [copied, setCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Copy full guide
  const handleCopy = () => {
    navigator.clipboard.writeText(`# How to ${query}\n\n${answer}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy code snippet
  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Print guide
  const handlePrint = () => {
    window.print();
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean up markdown for speech
      const plainText = answer
        .replace(/#{1,6}\s+/g, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`{3}[\s\S]*?`{3}/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      const utterance = new SpeechSynthesisUtterance(`How to ${query}. ${plainText}`);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Count steps in answer
  const stepMatches = useMemo(() => {
    const regex = /(?:^|\n)###?\s*(?:Step\s*\d+|[0-9]+\.)\s*[:\-\s]([^\n]+)/gi;
    const matches = [];
    let match;
    while ((match = regex.exec(answer)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }, [answer]);

  const totalSteps = stepMatches.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const toggleStep = (stepIdx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepIdx]: !prev[stepIdx],
    }));
  };

  // Parse inline text (bold, italic, inline code, links)
  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`(.*?)`)|(\[(.*?)\]\((.*?)\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const [, , boldText, , italicText, , codeText, , linkText, linkUrl] = match;
      const key = `${lastIndex}-${match.index}`;

      if (boldText !== undefined) {
        parts.push(<strong key={key} className="font-semibold text-zinc-100">{boldText}</strong>);
      } else if (italicText !== undefined) {
        parts.push(<em key={key} className="italic text-zinc-300">{italicText}</em>);
      } else if (codeText !== undefined) {
        parts.push(
          <code key={key} className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-sky-300 font-mono text-xs">
            {codeText}
          </code>
        );
      } else if (linkText !== undefined && linkUrl !== undefined) {
        parts.push(
          <a
            key={key}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            {linkText}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Render structured content
  const renderFormattedGuide = () => {
    const lines = answer.split('\n');
    const nodes: React.ReactNode[] = [];
    let currentList: string[] = [];
    let currentListType: 'ul' | 'ol' = 'ul';
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = '';
    let stepIndexCounter = 0;
    let codeBlockIndex = 0;

    const flushList = (key: string) => {
      if (currentList.length > 0) {
        const ListTag = currentListType === 'ol' ? 'ol' : 'ul';
        const listClass = currentListType === 'ol' 
          ? 'list-decimal list-outside pl-5 space-y-2 my-3 text-zinc-300 text-sm leading-relaxed' 
          : 'list-disc list-outside pl-5 space-y-2 my-3 text-zinc-300 text-sm leading-relaxed';
        
        nodes.push(
          <ListTag key={key} className={listClass}>
            {currentList.map((item, i) => (
              <li key={`${key}-${i}`} className="pl-1">
                {parseInline(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = [];
      }
    };

    const flushCodeBlock = (key: string) => {
      if (codeContent.length > 0) {
        const fullCode = codeContent.join('\n');
        const currentIndex = codeBlockIndex++;
        nodes.push(
          <div key={key} className="my-4 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
              <span>{codeLanguage || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(fullCode, currentIndex)}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-zinc-200 overflow-x-auto leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        codeContent = [];
        codeLanguage = '';
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();
      const nodeKey = `node-${lineIdx}`;

      // Fenced Code Block
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock(`code-block-${lineIdx}`);
          inCodeBlock = false;
        } else {
          flushList(`list-before-code-${lineIdx}`);
          inCodeBlock = true;
          codeLanguage = trimmed.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Callout Box (> **💡 Pro Tip:** or > **⚠️ Caution:** or > text)
      if (trimmed.startsWith('>')) {
        flushList(`list-before-quote-${lineIdx}`);
        const calloutText = trimmed.replace(/^>\s*/, '');
        const isWarning = calloutText.toLowerCase().includes('caution') || calloutText.toLowerCase().includes('warning');
        const isTip = calloutText.toLowerCase().includes('tip') || calloutText.toLowerCase().includes('note');

        nodes.push(
          <div
            key={nodeKey}
            className={`my-4 p-4 rounded-xl border flex items-start space-x-3 text-sm leading-relaxed ${
              isWarning
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : isTip
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : isTip ? (
                <Lightbulb className="w-5 h-5 text-sky-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            <div className="flex-1">{parseInline(calloutText)}</div>
          </div>
        );
        return;
      }

      // Step Header (### Step X: ...)
      const stepMatch = trimmed.match(/^#{2,4}\s*(?:Step\s*(\d+)|([0-9]+)\.)\s*[:\-\s](.*)/i);
      if (stepMatch) {
        flushList(`list-before-step-${lineIdx}`);
        const stepNum = stepIndexCounter++;
        const stepTitle = stepMatch[3] || `Step ${stepNum + 1}`;
        const isCompleted = completedSteps[stepNum] || false;

        nodes.push(
          <div
            key={nodeKey}
            className={`mt-6 mb-3 p-3.5 rounded-xl border transition-all duration-200 ${
              isCompleted
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleStep(stepNum)}
                className="flex items-center space-x-3 text-left group w-full"
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-600 group-hover:border-sky-400 flex items-center justify-center transition-colors">
                      <span className="text-[10px] font-bold text-zinc-400 group-hover:text-sky-400">
                        {stepNum + 1}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={`text-base font-bold tracking-tight transition-colors ${
                    isCompleted ? 'text-zinc-400 line-through' : 'text-white group-hover:text-sky-300'
                  }`}
                >
                  Step {stepNum + 1}: {stepTitle}
                </span>
              </button>

              <span className="text-[10px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 flex-shrink-0 ml-2">
                {isCompleted ? 'Completed' : 'Click to complete'}
              </span>
            </div>
          </div>
        );
        return;
      }

      // General Heading 2 & 3 (e.g. ### What You Need, ### Verification)
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
        flushList(`list-before-heading-${lineIdx}`);
        const cleanHeading = trimmed.replace(/^#{2,4}\s*/, '');
        nodes.push(
          <h3 key={nodeKey} className="text-lg font-bold text-zinc-100 mt-6 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>{parseInline(cleanHeading)}</span>
          </h3>
        );
        return;
      }

      // Unordered list item (* or -)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (currentListType !== 'ul') {
          flushList(`list-change-to-ul-${lineIdx}`);
          currentListType = 'ul';
        }
        currentList.push(trimmed.slice(2));
        return;
      }

      // Ordered list item (1. 2.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        if (currentListType !== 'ol') {
          flushList(`list-change-to-ol-${lineIdx}`);
          currentListType = 'ol';
        }
        currentList.push(numMatch[2]);
        return;
      }

      // Flush any open lists if encountering regular text
      flushList(`list-before-p-${lineIdx}`);

      // Paragraph
      if (trimmed !== '') {
        nodes.push(
          <p key={nodeKey} className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-3">
            {parseInline(line)}
          </p>
        );
      }
    });

    flushList('final-list');
    flushCodeBlock('final-code');

    return nodes;
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Top Banner / Card Container */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              How to {query}
            </h2>
          </div>

          <div className="flex items-center flex-wrap gap-2 no-print">
            {/* Audio Speech */}
            <button
              type="button"
              onClick={toggleSpeech}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                isSpeaking
                  ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-400/20'
                  : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title={isSpeaking ? 'Stop voice readout' : 'Listen to instructions'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
              title="Copy markdown guide"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden md:inline">Copy</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Clear Button */}
            <button
              type="button"
              onClick={onClear}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-rose-400 text-xs font-medium flex items-center space-x-1.5 transition-colors"
              title="Clear and start new search"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Step Progress Bar (if steps exist) */}
        {totalSteps > 0 && (
          <div className="my-5 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between no-print">
            <div className="flex items-center space-x-3 w-full max-w-xs">
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-zinc-400 flex items-center space-x-2">
              <span className="font-semibold text-white">
                {completedCount} of {totalSteps}
              </span>
              <span>steps completed ({progressPercent}%)</span>
            </div>
          </div>
        )}

        {/* Formatted Guide Body */}
        <div className="mt-6 space-y-1">{renderFormattedGuide()}</div>

        {/* Sources Section */}
        {sources && sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                  Verified Web Sources ({sources.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-500">Google Search Grounded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-sky-500/40 transition-all flex items-start space-x-3"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                      source.domain
                    )}&sz=64`}
                    alt=""
                    className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                      {source.title || source.domain}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{source.domain}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-sky-400 transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Follow Up Actions */}
        {onFollowUp && (
          <div className="mt-8 pt-6 border-t border-zinc-800 no-print">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Explore Deeper
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onFollowUp(`troubleshoot common mistakes and issues when ${query}`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5"
              >
                <span>Troubleshoot common issues</span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>
              <button
                type="button"
                onClick={() => onFollowUp(`alternative tools and methods to ${query}`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5"
              >
                <span>Alternative tools & methods</span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>
              <button
                type="button"
                onClick={() => onFollowUp(`advanced pro techniques and optimizations for ${query}`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5"
              >
                <span>Advanced optimizations</span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerDisplay;
