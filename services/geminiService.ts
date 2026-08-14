import { HowToResponse } from '../types';

export async function getHowToAnswer(
  prompt: string,
  category?: string
): Promise<HowToResponse> {
  const response = await fetch('/api/how-to', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      category: category && category !== 'All' ? category : undefined,
    }),
  });

  const data = await response.json().catch(() => ({ error: 'Failed to parse response from server' }));

  if (!response.ok) {
    let errorMsg = 'Failed to generate how-to instructions.';
    if (typeof data.error === 'string') {
      try {
        const parsed = JSON.parse(data.error);
        if (parsed.error?.message) {
          errorMsg = parsed.error.message;
        } else {
          errorMsg = data.error;
        }
      } catch {
        errorMsg = data.error;
      }
    } else if (data.error && typeof data.error === 'object') {
      errorMsg = data.error.message || JSON.stringify(data.error);
    } else if (response.status === 429) {
      errorMsg = 'Gemini API rate limit or quota exceeded. Please wait a moment and retry.';
    }

    throw new Error(errorMsg);
  }

  return {
    answer: data.answer,
    sources: data.sources || [],
    searchQueries: data.searchQueries || [],
    model: data.model || 'gemini-3.7-flash',
  };
}
