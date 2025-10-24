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
   * - Ordered lists (1.)
   * - Bold text (**)
   * - Italic text (* or _)
   * - Inline code (`)
   * - Fenced code blocks (```)
   * - Paragraphs
   */
  const parseMarkdownToJsx = (markdown: string): React.ReactNode[] => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let orderedListItems: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    // Parses inline elements like bold, italics, and inline code.
    const parseInline = (text: string): React.ReactNode => {
      const elements: React.ReactNode[] = [];
      const regex = /(\*\*(.*?)\*\*)|(_(.*?)_)|(\*(.*?)\*)|(`(.*?)`)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Push text before the match
        if (match.index > lastIndex) {
          elements.push(text.substring(lastIndex, match.index));
        }

        const [, , boldContent, , italicContentUnder, , italicContentStar, , codeContent] = match;
        
        const key = `${lastIndex}-${match.index}`;

        if (boldContent !== undefined) {
          elements.push(<strong key={key} className="font-semibold text-slate-100">{boldContent}</strong>);
        } else if (italicContentUnder !== undefined) {
          elements.push(<em key={key} className="italic text-slate-200">{italicContentUnder}</em>);
        } else if (italicContentStar !== undefined) {
          elements.push(<em key={key} className="italic text-slate-200">{italicContentStar}</em>);
        } else if (codeContent !== undefined) {
          elements.push(<code key={key} className="bg-slate-700 text-cyan-300 rounded px-1.5 py-0.5 font-mono text-sm">{codeContent}</code>);
        }

        lastIndex = regex.lastIndex;
      }

      // Push remaining text after last match
      if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
      }
      
      return elements.length > 1 ? React.createElement(React.Fragment, {}, ...elements) : (elements[0] || '');
    };

    // Pushes any accumulated unordered list items to the elements array as a <ul>
    const flushUnorderedList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key} className="list-disc list-inside space-y-2 my-4 pl-4">
            {listItems.map((item, index) => (
              <li key={`${key}-li-${index}`} className="text-slate-300">{parseInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };
    
    // Pushes any accumulated ordered list items to the elements array as a <ol>
    const flushOrderedList = (key: string) => {
        if (orderedListItems.length > 0) {
          elements.push(
            <ol key={key} className="list-decimal list-inside space-y-2 my-4 pl-4">
              {orderedListItems.map((item, index) => (
                <li key={`${key}-li-${index}`} className="text-slate-300">{parseInline(item)}</li>
              ))}
            </ol>
          );
          orderedListItems = [];
        }
    };

    // Pushes any accumulated code lines to the elements array as a <pre><code> block
    const flushCodeBlock = (key: string) => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <div key={key} className="bg-slate-900/70 rounded-lg my-4 border border-slate-700">
            {codeBlockLang && (
              <div className="text-xs text-slate-400 px-4 py-2 border-b border-slate-700 font-mono uppercase tracking-wider">
                {codeBlockLang}
              </div>
            )}
            <pre className="p-4 overflow-x-auto">
              <code className="text-slate-300 font-mono text-sm whitespace-pre">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeBlockLang = '';
      }
    };

    lines.forEach((line, index) => {
      const lineKey = `line-${index}`;
      const trimmedLine = line.trim();
      
      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          flushCodeBlock(`code-${index}`);
          inCodeBlock = false;
        } else {
          // Start of code block
          flushUnorderedList(`ul-${index}`);
          flushOrderedList(`ol-${index}`);
          inCodeBlock = true;
          codeBlockLang = trimmedLine.substring(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Heading 3
      if (trimmedLine.startsWith('### ')) {
        flushUnorderedList(`ul-${index}`);
        flushOrderedList(`ol-${index}`);
        elements.push(<h3 key={lineKey} className="text-xl font-bold text-slate-100 mt-6 mb-3">{parseInline(trimmedLine.substring(4))}</h3>);
        return;
      }
      // Heading 2
      if (trimmedLine.startsWith('## ')) {
        flushUnorderedList(`ul-${index}`);
        flushOrderedList(`ol-${index}`);
        elements.push(<h2 key={lineKey} className="text-2xl font-bold text-slate-100 mt-8 mb-4">{parseInline(trimmedLine.substring(3))}</h2>);
        return;
      }
      // Unordered list item
      if (trimmedLine.startsWith('* ')) {
        flushOrderedList(`ol-${index}`); // flush other list type
        listItems.push(trimmedLine.substring(2));
        return;
      }
      // Ordered list item
      const orderedMatch = trimmedLine.match(/^(\d+)\. (.*)/);
      if (orderedMatch) {
        flushUnorderedList(`ul-${index}`); // flush other list type
        orderedListItems.push(orderedMatch[2]);
        return;
      }

      // If we encounter a non-list item, flush the current lists
      flushUnorderedList(`ul-${index}`);
      flushOrderedList(`ol-${index}`);

      // Paragraph
      if (trimmedLine !== '') {
        elements.push(<p key={lineKey} className="mb-4 text-slate-300">{parseInline(line)}</p>);
      }
    });

    // Flush any remaining list or code items at the end of the text
    flushUnorderedList('ul-end');
    flushOrderedList('ol-end');
    flushCodeBlock('code-end');

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