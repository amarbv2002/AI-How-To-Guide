
export interface Source {
  uri: string;
  title: string;
}

// This represents the structure of the grounding metadata from the Gemini API
interface WebSource {
  uri: string;
  title: string;
}

interface GroundingChunk {
  web: WebSource;
}

export type GroundingMetadata = GroundingChunk[];
