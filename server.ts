import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please ensure your Gemini API key is set in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are an elite, highly structured How-To instruction guide engine.
Your mission is to provide exceptionally clear, practical, step-by-step actionable instructions for any user query.

Guidelines for formatting your response:
1. Begin with a brief overview (1-2 sentences) summarizing what will be accomplished, estimated time required, and difficulty level.
2. If tools, materials, or prerequisites are needed, list them under a '### 🧰 What You Will Need' section.
3. Provide the main instructions in clear numbered steps (e.g., '### Step 1: [Action Title]', '### Step 2: [Action Title]').
4. Inside steps, use bullet points for specific micro-actions. Include bold action verbs.
5. Use callouts like '> **💡 Pro Tip:** ...' or '> **⚠️ Caution:** ...' for critical advice or safety notes.
6. Provide a '### 🔍 Troubleshooting & Pro Tips' or '### ✅ Verification' section at the end so the reader can verify success.
7. Always provide accurate, up-to-date, safe, and verifiable information grounded in real knowledge.`;

const CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

interface RawChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

async function generateWithFallback(
  ai: GoogleGenAI,
  contextualPrompt: string
) {
  let lastError: unknown = null;

  // Try candidate models with Google Search Grounding first
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: contextualPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      return { response, usedModel: model, grounded: true };
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Attempt with ${model} (with search grounding) failed: ${errMsg}`);
      
      // If error is not 429 quota or model not found, try next immediately
    }
  }

  // Fallback: If search grounding had quota/tool limits, try candidate models without search tool
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: contextualPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      return { response, usedModel: model, grounded: false };
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Fallback attempt with ${model} (without search tool) failed: ${errMsg}`);
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // API Route: Health Check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      models: CANDIDATE_MODELS,
      time: new Date().toISOString(),
    });
  });

  // API Route: Generate How-To Answer with resilient fallback
  app.post("/api/how-to", async (req: Request, res: Response) => {
    try {
      const { prompt, category } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        res.status(400).json({ error: "A valid 'prompt' string is required." });
        return;
      }

      const ai = getAiClient();
      const userQuery = prompt.trim();
      const contextualPrompt = category && category !== "All"
        ? `[Category: ${category}] ${userQuery}`
        : userQuery;

      const { response, usedModel } = await generateWithFallback(ai, contextualPrompt);

      const answer = response.text || "No response generated.";

      // Extract Grounding Chunks & Sources
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      const sources: { uri: string; title: string; domain: string }[] = [];
      if (Array.isArray(groundingChunks)) {
        for (const chunk of groundingChunks as RawChunk[]) {
          if (chunk.web?.uri && chunk.web?.title) {
            try {
              const urlObj = new URL(chunk.web.uri);
              const domain = urlObj.hostname.replace(/^www\./, "");
              sources.push({
                uri: chunk.web.uri,
                title: chunk.web.title,
                domain,
              });
            } catch {
              sources.push({
                uri: chunk.web.uri,
                title: chunk.web.title,
                domain: "web-source",
              });
            }
          }
        }
      }

      // Deduplicate sources by URI
      const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

      res.json({
        answer,
        sources: uniqueSources,
        searchQueries: webSearchQueries,
        model: usedModel,
      });
    } catch (error: unknown) {
      console.error("Error handling /api/how-to request:", error);
      
      let errorMessage = "An unexpected error occurred.";
      let isRateLimit = false;
      let statusCode = 500;

      if (error instanceof Error) {
        errorMessage = error.message;
        if (
          errorMessage.includes("429") ||
          errorMessage.includes("quota") ||
          errorMessage.includes("RESOURCE_EXHAUSTED") ||
          errorMessage.includes("rate-limits")
        ) {
          isRateLimit = true;
          statusCode = 429;
          errorMessage = "Gemini API request rate limit reached. The system attempted multiple model fallbacks. Please wait a few seconds before retrying.";
        }
      }

      res.status(statusCode).json({
        error: errorMessage,
        isRateLimit,
        model: "gemini-3.7-flash",
      });
    }
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI How-To Guide Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
