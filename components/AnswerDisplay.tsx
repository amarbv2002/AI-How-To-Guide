
import React from 'react';
import { Source } from '../types';

interface AnswerDisplayProps {
  answer: string;
  sources: Source[];
  onClear: () => void;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, sources, onClear }) => {

  /**
   * Parses a markdown string into an array of React elements.
   * Supports:
   * - Headings (##, ###)
   * - Unordered lists (*)
   * - Bold text (**)
   * - Paragraphs
   */
  const parseMarkdownToJsx = (markdown: string): React.ReactNode[] => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    // Parses inline elements like bold text
    const parseInline = (text: string): React.ReactNode => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) { // Bold text
          return <strong key={index} className="font-semibold text-slate-100">{part}</strong>;
        }
        return part;
      });
    };

    // Pushes any accumulated list items to the elements array as a <ul>
    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key} className="list-disc list-inside space-y-2 my-4 pl-4">
            {listItems.map((item, index) => (
              <li key={index} className="text-slate-300">{parseInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      // Heading 3
      if (line.startsWith('### ')) {
        flushList(`ul-${index}`);
        elements.push(<h3 key={index} className="text-xl font-bold text-slate-100 mt-6 mb-3">{parseInline(line.substring(4))}</h3>);
        return;
      }
      // Heading 2
      if (line.startsWith('## ')) {
        flushList(`ul-${index}`);
        elements.push(<h2 key={index} className="text-2xl font-bold text-slate-100 mt-8 mb-4">{parseInline(line.substring(3))}</h2>);
        return;
      }
      // List item
      if (line.startsWith('* ')) {
        listItems.push(line.substring(2));
        return;
      }

      // If we encounter a non-list item, flush the current list
      flushList(`ul-${index}`);

      // Paragraph
      if (line.trim() !== '') {
        elements.push(<p key={index} className="mb-4 text-slate-300">{parseInline(line)}</p>);
      }
    });

    // Flush any remaining list items at the end of the text
    flushList('ul-end');

    return elements;
  };

  const formattedAnswer = parseMarkdownToJsx(answer);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-lg animate-fade-in">
      <div className="max-w-none">
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
            <h2 className="text-2xl font-bold text-cyan-400">Answer</h2>
            <button
              onClick={onClear}
              className="flex items-center text-slate-400 hover:text-white transition-colors duration-200 text-sm font-semibold py-1 px-3 rounded-lg hover:bg-slate-700"
              aria-label="Clear answer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
            </button>
        </div>
        <div className="text-lg leading-relaxed">{formattedAnswer}</div>
      </div>

      {sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4">Sources</h3>
          <ul className="space-y-3">
            {sources.map((source, index) => (
              <li key={index} className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 break-words"
                  title={source.uri}
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnswerDisplay;
