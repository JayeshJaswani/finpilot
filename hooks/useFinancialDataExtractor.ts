import { GoogleGenAI } from '@google/genai';
import { runtimeConfig } from '../resources/financial-data-assistant-93484032/config';
import { fileToBase64 } from '../utils/fileUtils';
import { fetchCompanyNews } from '../utils/newsService';
import { ANALYSIS_PROMPT } from '../constants';
import type { AnalysisResult, GroundingSource } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY environment variable not set. Please set it in .env file.");
} else if (!API_KEY.startsWith("AIza")) {
  console.warn("VITE_GEMINI_API_KEY does not start with 'AIza'. This may be an invalid API key. Please check your .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 5,
  delay: number = 4000,
  backoff: number = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryableError =
      error.status === 429 ||
      error.code === 429 ||
      error.status === 503 ||
      error.code === 503 ||
      error.status === 500 ||
      error.code === 500 ||
      error.status === 502 ||
      error.code === 502 ||
      error.message?.includes("429") ||
      error.message?.includes("503") ||
      error.message?.includes("RESOURCE_EXHAUSTED") ||
      error.message?.includes("Quota exceeded") ||
      error.message?.includes("Service Unavailable") ||
      error.message?.includes("Internal Server Error");

    if (retries > 0 && isRetryableError) {
      console.warn(`Transient error (${error.status || error.code || error.message}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * backoff, backoff);
    }
    throw error;
  }
}

const parseJsonResponse = (text: string): AnalysisResult => {
  // The model might wrap the JSON in markdown backticks, or just return raw JSON.
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  const jsonString = match ? match[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonString);
    // Basic validation to ensure the structure is what we expect.
    if (
      !parsed.companyName ||
      !parsed.financialsLocal?.revenue === undefined ||
      !parsed.financialsLocal?.unit ||
      !parsed.analysis?.ratioAnalysis?.summary ||
      !parsed.analysis?.trendAnalysis?.chartData ||
      !Array.isArray(parsed.analysis.trendAnalysis.chartData)
    ) {
      throw new Error('Invalid or incomplete JSON structure in model response.');
    }
    return parsed as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse JSON:", error, "\nRaw text received:", jsonString);
    throw new Error("Could not parse the financial analysis from the model's response. The document might not be a compatible financial statement.");
  }
};

export const useFinancialDataExtractor = () => {
  const extractData = async (file: File, onProgress?: (stage: string, progress: number) => void): Promise<{ analysis: AnalysisResult; sources: GroundingSource[] }> => {
    onProgress?.("Initializing AI Models...", 10);
    const base64Data = await fileToBase64(file);

    const model = 'gemini-2.5-flash';

    onProgress?.("Extracting Financial Data via OCR... (Auto-retry enabled)", 30);
    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: ANALYSIS_PROMPT },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        temperature: runtimeConfig.parameters.temperature,
        topP: runtimeConfig.parameters.topP,
      },
    }));

    onProgress?.("Processing & Validating Response...", 60);

    const responseText = response.text;
    if (!responseText) {
      const blockReason = response.candidates?.[0]?.finishReason;
      if (blockReason === 'SAFETY') {
        throw new Error("The request was blocked due to safety settings. Please check the content.");
      }
      throw new Error("Received an empty response from the model. The document might be unreadable or not contain financial data.");
    }

    onProgress?.("Performing Financial Ratios & Trend Analysis...", 70);

    const analysis = parseJsonResponse(responseText);
    let sources: GroundingSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      sources = groundingMetadata.groundingChunks
        .map(chunk => {
          if (chunk.web && chunk.web.uri && chunk.web.title) {
            return {
              web: {
                uri: chunk.web.uri,
                title: chunk.web.title
              }
            };
          }
          return null;
        })
        .filter((s) => s !== null) as GroundingSource[];
    }

    // --- INTEGRATION: Fetch Verified News ---
    onProgress?.("Scanning verified news sources & Calculating Sentiment...", 85);
    try {
      const { tickerSymbol, companyName } = analysis;
      const verifiedNews = await fetchCompanyNews(tickerSymbol, companyName);

      if (verifiedNews.length > 0) {
        if (!analysis.analysis.newsAnalysis) {
          analysis.analysis.newsAnalysis = { events: [], summary: "" };
        }
        analysis.analysis.newsAnalysis.events = verifiedNews;
        analysis.analysis.newsAnalysis.summary = `Verified recent news retrieved for ${companyName}. See articles below for details.`;
      }
    } catch (newsError) {
      console.error("Error fetching verified news:", newsError);
    }
    // ----------------------------------------

    onProgress?.("Finalizing Analysis...", 100);

    return { analysis, sources };
  };

  return { extractData };
};
