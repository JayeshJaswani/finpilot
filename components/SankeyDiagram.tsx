import React, { useState } from 'react';
import { Chart } from 'react-google-charts';
import type { AnalysisResult, GroundingSource, TrendChartData } from '../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils';

// Icons
const TrendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const RatioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0v6m0-6L9 13" /><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2" /></svg>;
const RecIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707" /></svg>;
const NewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

// Helper functions (omitted identical ones for brevity if possible, keeping logical flow)
const formatCurrency = (value: number, currency: string, unit: string | undefined) => {
  let unitAbbreviation = '';
  if (unit) {
    const lowerUnit = unit.toLowerCase();
    if (lowerUnit.includes('million')) unitAbbreviation = ' M';
    else if (lowerUnit.includes('billion')) unitAbbreviation = ' B';
    else if (lowerUnit.includes('crore')) unitAbbreviation = ' Cr';
    else if (lowerUnit.includes('thousand')) unitAbbreviation = ' K';
  }

  try {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
    return `${formattedNumber}${unitAbbreviation}`;
  } catch (e) {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
    return `${currency} ${formattedNumber}${unitAbbreviation}`;
  }
};

const formatRatio = (value: number | null, isPercent = false) => {
  if (value === null || typeof value === 'undefined') return <span className="text-gray-500">N/A</span>;
  return <>{value.toFixed(2)}{isPercent ? '%' : ''}</>;
};

// Sub-components
const SourceCitations: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-8 pt-6 border-t border-gray-700">
      <h4 className="text-sm font-semibold text-gray-400 mb-3">Sources</h4>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {sources.map((source, index) => source.web && (
          <li key={index}><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate" title={source.web.uri}>{`[${index + 1}] ${source.web.title || new URL(source.web.uri).hostname}`}</a></li>
        ))}
      </ul>
    </div>
  );
};

const TrendAnalysisChart: React.FC<{ data: TrendChartData[], unit: string | undefined }> = ({ data, unit }) => {
  const unitText = unit ? ` (in ${unit})` : '';
  const chartData = [['Year', 'Revenue', 'Profit Before Tax'], ...data.map(d => [String(d.year), d.revenue, d.profitBeforeTax])];
  const options = {
    backgroundColor: 'transparent',
    legend: { position: 'top', textStyle: { color: '#E5E7EB' } },
    hAxis: { textStyle: { color: '#9CA3AF' } },
    vAxes: { 0: { textStyle: { color: '#A7F3D0' }, title: `Revenue${unitText}`, titleTextStyle: { color: '#A7F3D0' } }, 1: { textStyle: { color: '#BAE6FD' }, title: `Profit Before Tax${unitText}`, titleTextStyle: { color: '#BAE6FD' } } },
    series: { 0: { type: 'bars', targetAxisIndex: 0, color: '#34D399' }, 1: { type: 'line', targetAxisIndex: 1, color: '#60A5FA' } },
    chartArea: { left: 80, top: 50, width: '85%', height: '70%' },
    seriesType: 'bars',
  };
  return <Chart chartType="ComboChart" width="100%" height="400px" data={chartData} options={options} loader={<div className="text-center p-8 text-gray-400">Generating Chart...</div>} />;
};

const RatioCard: React.FC<{ title: string; value: React.ReactNode }> = ({ title, value }) => (
  <div className="bg-gray-900/70 p-4 rounded-md text-center">
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

interface AnalysisDashboardProps {
  result: AnalysisResult;
  sources: GroundingSource[];
  onReset: () => void;
  fileName: string;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, sources, onReset, fileName }) => {
  const [currencyDisplay, setCurrencyDisplay] = useState<'local' | 'usd'>('local');
  const { companyName, tickerSymbol, currency, mostRecentYear, financialsLocal, financialsUSD, analysis, recommendations, investmentRecommendation } = result;

  const financials = currencyDisplay === 'local' || !financialsUSD ? financialsLocal : financialsUSD;
  const displayCurrency = currencyDisplay === 'local' || !financialsUSD ? currency : 'USD';
  const displayUnit = financials.unit;

  const { revenue, cogs, opex } = financials;
  const grossProfit = revenue - cogs;
  const netOperatingIncome = grossProfit - opex;

  const sankeyData = [['From', 'To', 'Value'], ['Revenue', 'Cost of Goods Sold', cogs > 0 ? cogs : 0], ['Revenue', 'Gross Profit', grossProfit > 0 ? grossProfit : 0], ['Gross Profit', 'Operating Expenses', opex > 0 ? opex : 0], ['Gross Profit', 'Net Operating Income', netOperatingIncome > 0 ? netOperatingIncome : 0]];
  const sankeyOptions = { height: 350, backgroundColor: 'transparent', sankey: { node: { label: { fontName: 'Inter', fontSize: 14, color: '#E5E7EB', bold: true }, labelPadding: 20, nodePadding: 25, width: 20, colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] }, link: { colorMode: 'gradient', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] } }, tooltip: { textStyle: { fontName: 'Inter', color: '#1F2937' }, isHtml: true } };

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-fade-in relative">
      <div className="absolute top-0 right-0 flex gap-2">
        <button onClick={() => exportToCSV(result)} className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs px-3 py-1.5 rounded flex items-center gap-1"><DownloadIcon /> CSV</button>
        <button onClick={() => exportToExcel(result)} className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1"><DownloadIcon /> Excel</button>
        <button onClick={() => exportToPDF(result)} className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1"><DownloadIcon /> PDF</button>
      </div>

      <div className="w-full text-center mt-4">
        <h2 className="text-3xl font-bold text-white">{companyName} {tickerSymbol && `(${tickerSymbol})`}</h2>
        <p className="text-gray-400 mt-1">Financial Analysis for <span className="font-medium text-gray-300">{fileName}</span></p>
      </div>

      {investmentRecommendation && (
        <div className={`w-full p-4 rounded-lg border flex flex-col md:flex-row items-center gap-4 ${investmentRecommendation.action === 'Buy' ? 'bg-green-900/30 border-green-500/50' : investmentRecommendation.action === 'Sell' ? 'bg-red-900/30 border-red-500/50' : 'bg-yellow-900/30 border-yellow-500/50'}`}>
          <div className={`px-4 py-2 rounded-full text-lg font-bold shadow-sm ${investmentRecommendation.action === 'Buy' ? 'bg-green-600 text-white' : investmentRecommendation.action === 'Sell' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}`}>
            {investmentRecommendation.action.toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider block mb-1">Recommendation</span>
            <p className="text-gray-200 text-sm leading-relaxed">{investmentRecommendation.justification}</p>
          </div>
        </div>
      )}

      {financialsUSD && (
        <div className="flex items-center gap-2 bg-gray-700/50 p-1 rounded-full">
          <button onClick={() => setCurrencyDisplay('local')} className={`px-4 py-1 rounded-full text-sm font-semibold transition ${currencyDisplay === 'local' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600/50'}`}>{currency}</button>
          <button onClick={() => setCurrencyDisplay('usd')} className={`px-4 py-1 rounded-full text-sm font-semibold transition ${currencyDisplay === 'usd' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600/50'}`}>USD</button>
        </div>
      )}

      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-700/50 p-4 rounded-lg"><p className="text-sm text-gray-400">Revenue</p><p className="text-2xl font-bold text-green-400">{formatCurrency(revenue, displayCurrency, displayUnit)}</p></div>
        <div className="bg-gray-700/50 p-4 rounded-lg"><p className="text-sm text-gray-400">COGS</p><p className="text-2xl font-bold text-yellow-400">{formatCurrency(cogs, displayCurrency, displayUnit)}</p></div>
        <div className="bg-gray-700/50 p-4 rounded-lg"><p className="text-sm text-gray-400">OpEx</p><p className="text-2xl font-bold text-orange-400">{formatCurrency(opex, displayCurrency, displayUnit)}</p></div>
        <div className="bg-gray-700/50 p-4 rounded-lg"><p className="text-sm text-gray-400">Net Operating Income</p><p className={`text-2xl font-bold ${netOperatingIncome >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(netOperatingIncome, displayCurrency, displayUnit)}</p></div>
      </div>

      <div className="w-full p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-2">Revenue Flow ({mostRecentYear}) {displayUnit && <span className="text-base font-medium text-gray-400">(in {displayUnit})</span>}</h3>
        <Chart chartType="Sankey" width="100%" data={sankeyData} options={sankeyOptions} loader={<div className="text-center p-8 text-gray-400">Generating Diagram...</div>} />
      </div>

      {analysis.newsAnalysis && (
        <div className="w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="flex items-center gap-3 text-xl font-bold text-white"><NewsIcon /> Market News & Sentiment</h3>
            <a href="https://www.alphavantage.co/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1 bg-gray-900/50 hover:bg-gray-900 rounded-full border border-gray-700 hover:border-blue-500/50 transition-colors group">
              <span className="text-xs text-gray-400 group-hover:text-blue-400">Powered by</span>
              <span className="text-sm font-bold text-blue-400">Alpha Vantage</span>
            </a>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6 italic border-l-4 border-blue-500 pl-4 py-1 bg-gray-900/30">{analysis.newsAnalysis.summary}</p>
          <div className="space-y-4">
            {analysis.newsAnalysis.events.map((event, i) => (
              event.url ? (
                <a
                  key={i}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-700/30 rounded border border-gray-700/50 hover:bg-gray-700/50 hover:border-blue-500/30 transition-all group cursor-pointer"
                >
                  <div className="sm:w-32 flex-shrink-0 text-sm text-gray-500 font-mono group-hover:text-gray-400">{event.date}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-base group-hover:text-blue-400 transition-colors">{event.title}</h4>
                    <p className="text-xs text-blue-400 mb-1">{event.source}</p>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">{event.summary}</p>
                  </div>
                </a>
              ) : (
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-700/30 rounded border border-gray-700/50">
                  <div className="sm:w-32 flex-shrink-0 text-sm text-gray-500 font-mono">{event.date}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-base">{event.title}</h4>
                    <p className="text-xs text-blue-400 mb-1">{event.source}</p>
                    <p className="text-sm text-gray-400">{event.summary}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <div className="w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-4"><TrendIcon /> Trend Analysis</h3>
        <p className="text-gray-300 leading-relaxed mb-6">{analysis.trendAnalysis.summary}</p>
        <div className="h-64 sm:h-96">
          {analysis.trendAnalysis.chartData && analysis.trendAnalysis.chartData.length > 1 ? (
            <TrendAnalysisChart data={analysis.trendAnalysis.chartData} unit={displayUnit} />
          ) : <p className="text-center text-gray-500 py-8">Not enough data for trend chart.</p>}
        </div>
      </div>

      <div className="w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-4"><RatioIcon /> Ratio Analysis ({mostRecentYear})</h3>
        <p className="text-gray-300 leading-relaxed mb-6">{analysis.ratioAnalysis.summary}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <RatioCard title="Current Ratio" value={formatRatio(analysis.ratioAnalysis.liquidity.currentRatio)} />
          <RatioCard title="Gross Margin" value={formatRatio(analysis.ratioAnalysis.profitability.grossMarginPercent, true)} />
          <RatioCard title="Operating Margin" value={formatRatio(analysis.ratioAnalysis.profitability.operatingMarginPercent, true)} />
          <RatioCard title="Net Profit Margin" value={formatRatio(analysis.ratioAnalysis.profitability.netProfitMarginPercent, true)} />
          <RatioCard title="Debt-to-Equity" value={formatRatio(analysis.ratioAnalysis.debt.debtToEquity)} />
          <RatioCard title="Asset Turnover" value={formatRatio(analysis.ratioAnalysis.efficiency.assetTurnover)} />
        </div>
      </div>

      <div className="w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-4"><RecIcon /> Operational Recommendations</h3>
        <ul className="space-y-3 list-disc list-inside text-gray-300">
          {recommendations.map((rec, i) => <li key={i} className="pl-2">{rec}</li>)}
        </ul>
      </div>

      <SourceCitations sources={sources} />

      <button onClick={onReset} className="mt-4 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform hover:scale-105">Analyze Another Document</button>
    </div>
  );
};
