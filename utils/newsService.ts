import { NewsEvent } from '../types';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

interface AlphaVantageNewsItem {
    title: string;
    url: string;
    time_published: string;
    authors: string[];
    summary: string;
    banner_image: string;
    source: string;
    category_within_source: string;
    source_domain: string;
    topics: { topic: string; relevance_score: string }[];
    overall_sentiment_score: number;
    overall_sentiment_label: string;
}

interface AlphaVantageResponse {
    items?: string;
    sentiment_score_definition?: string;
    relevance_score_definition?: string;
    feed?: AlphaVantageNewsItem[];
    "Error Message"?: string;
    "Note"?: string;
}

export const fetchCompanyNews = async (ticker: string | null, companyName: string): Promise<NewsEvent[]> => {
    if (!ALPHA_VANTAGE_API_KEY) {
        console.warn("Alpha Vantage API Key is missing. Skipping verified news fetch.");
        return [];
    }

    if (!ticker && !companyName) return [];



    // If we only have company name, we might search by topics or keywords, but NEWS_SENTIMENT works best with tickers.
    // Alternatively we can use 'q' parameter for company name search.
    const searchUrl = ticker
        ? `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&sort=LATEST&limit=5&apikey=${ALPHA_VANTAGE_API_KEY}`
        : `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&q=${encodeURIComponent(companyName)}&sort=LATEST&limit=5&apikey=${ALPHA_VANTAGE_API_KEY}`;

    try {
        const response = await fetch(searchUrl);
        const data: AlphaVantageResponse = await response.json();

        if (data["Error Message"]) {
            console.error("Alpha Vantage API Error:", data["Error Message"]);
            return [];
        }

        if (data.Note) {
            console.warn("Alpha Vantage API Limit/Note:", data.Note);
            // Often 'Note' means rate limit reached.
            return [];
        }

        if (!data.feed) return [];

        return data.feed.map((item) => {
            // Format date: 20240115T123000 -> 2024-01-15
            const dateStr = item.time_published;
            const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

            return {
                date: formattedDate,
                title: item.title,
                source: item.source || item.source_domain,
                summary: item.summary,
                url: item.url,
            };
        }).slice(0, 5); // Ensure max 5
    } catch (error) {
        console.error("Failed to fetch news from Alpha Vantage:", error);
        return [];
    }
};
