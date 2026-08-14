export interface Source {
  uri: string;
  title: string;
  domain: string;
}

export interface HowToResponse {
  answer: string;
  sources: Source[];
  searchQueries?: string[];
  model?: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  category?: string;
  sourcesCount: number;
  previewText?: string;
  favorite?: boolean;
}

export type Category = 
  | 'All'
  | 'Technology & Coding'
  | 'DIY & Home'
  | 'Culinary & Cooking'
  | 'Career & Productivity'
  | 'Creative & Design'
  | 'Health & Fitness';
