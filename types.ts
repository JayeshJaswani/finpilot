export interface Financials {
  revenue: number;
  cogs: number;
  opex: number;
  unit: string;
}

export interface FinancialsUSD extends Financials {
  exchangeRate: number;
}

export interface RatioAnalysis {
  summary: string;
  liquidity: { currentRatio: number | null };
  profitability: {
    grossMarginPercent: number | null;
    operatingMarginPercent: number | null;
    netProfitMarginPercent: number | null;
  };
  debt: { debtToEquity: number | null };
  efficiency: { assetTurnover: number | null };
}

export interface TrendChartData {
  year: string | number;
  revenue: number;
  profitBeforeTax: number;
}

export interface TrendAnalysis {
  summary: string;
  chartData: TrendChartData[];
}

export interface NewsEvent {
  date: string;
  title: string;
  source: string;
  summary: string;
  url?: string;
}

export interface StockRecommendation {
  action: 'Buy' | 'Hold' | 'Sell';
  justification: string;
}

export interface AnalysisResult {
  companyName: string;
  tickerSymbol: string | null;
  currency: string;
  mostRecentYear: number | string;
  financialsLocal: Financials;
  financialsUSD: FinancialsUSD;
  analysis: {
    ratioAnalysis: RatioAnalysis;
    trendAnalysis: TrendAnalysis;
    newsAnalysis?: {
      events: NewsEvent[];
      summary: string;
    };
  };
  recommendations: string[];
  investmentRecommendation?: StockRecommendation;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
