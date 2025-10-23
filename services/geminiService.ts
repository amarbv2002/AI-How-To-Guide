
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingMetadata, Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface HowToResult {
  answer: string;
  sources: Source[];
}

export async function getHowToAnswer(prompt: string): Promise<HowToResult> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const answer = response.text;

    const groundingMetadata: GroundingMetadata | undefined = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    const sources: Source[] = groundingMetadata
      ? groundingMetadata.map(chunk => ({
          uri: chunk.web.uri,
          title: chunk.web.title,
        })).filter(source => source.uri && source.title)
      : [];
      
    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

    return { answer, sources: uniqueSources };
  } catch (error) {
    console.error("Error fetching 'how to' answer:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get answer from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching the answer.");
  }
}
