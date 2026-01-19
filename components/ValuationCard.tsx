import React, { useState, useEffect } from 'react';

interface DCFRequest {
    historical_revenue: number;
    growth_rate_assumptions: number[];
    ebit_margin_assumptions: number[];
    tax_rate: number;
    wacc: number;
    terminal_growth_rate: number;
    shares_outstanding: number;
    da_percent_revenue: number;
    capex_percent_revenue: number;
    nwc_percent_revenue: number;
    net_debt: number;
    currency: string;
    unit: string;
    exchange_rate: number;
}

interface ValuationResult {
    share_price: number;
    equity_value: number;
    enterprise_value: number;
    sensitivity_analysis: Record<string, Record<string, number>>;
    projections: any[];
}

interface ValuationCardProps {
    historicalRevenue: number;
    companyName: string;
    currency: string;
    unit?: string;
    exchangeRate?: number;
}

export const ValuationCard: React.FC<ValuationCardProps> = ({
    historicalRevenue,
    companyName,
    currency,
    unit = "",
    exchangeRate = 1.0
}) => {
    const [result, setResult] = useState<ValuationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Default Assumptions
    const [assumptions, setAssumptions] = useState<DCFRequest>({
        historical_revenue: historicalRevenue,
        growth_rate_assumptions: [0.05, 0.05, 0.04, 0.04, 0.03],
        ebit_margin_assumptions: [0.15, 0.15, 0.15, 0.15, 0.15],
        tax_rate: 0.21,
        wacc: 0.10,
        terminal_growth_rate: 0.02,
        shares_outstanding: 1000000000,
        da_percent_revenue: 0.03,
        capex_percent_revenue: 0.03,
        nwc_percent_revenue: 0.01,
        net_debt: 0,
        currency: currency,
        unit: unit,
        exchange_rate: exchangeRate
    });

    useEffect(() => {
        // Update assumptions when props change (e.g. new file loaded)
        setAssumptions(prev => ({
            ...prev,
            historical_revenue: historicalRevenue,
            currency: currency,
            unit: unit,
            exchange_rate: exchangeRate
        }));
    }, [historicalRevenue, currency, unit, exchangeRate]);

    useEffect(() => {
        calculateValuation();
    }, [assumptions.historical_revenue]);

    const calculateValuation = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/calculate-dcf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assumptions)
            });

            if (!response.ok) throw new Error('Failed to calculate valuation');

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch('http://localhost:8000/export-dcf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assumptions)
            });

            if (!response.ok) throw new Error('Failed to download Excel file');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${companyName.replace(/\s+/g, '_')}_DCF_Valuation_USD.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download failed", err);
            setError("Failed to download model");
        }
    };

    const formatCurrency = (val: number) => {
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
        } catch {
            return `USD ${val.toLocaleString()}`;
        }
    };

    if (loading && !result) return <div className="p-6 bg-gray-800 rounded-lg animate-pulse text-gray-400 text-center">Calculating DCF Valuation in USD...</div>;
    if (error) return <div className="p-6 bg-red-900/30 border border-red-500 rounded-lg text-red-200">Error: {error}</div>;
    if (!result) return null;

    return (
        <div className="w-full bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-green-400">📊</span> DCF Valuation Model
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        5-Year Projection & Sensitivity Analysis <span className="text-gray-500">|</span>
                        <span className="text-blue-300 ml-1">Values in {unit || "Thousands"} USD</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        <span>📥</span> Download Excel (USD)
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Summary Card */}
                <div className="flex-1 bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-lg border border-gray-600 flex flex-col items-center justify-center text-center shadow-inner">
                    <p className="text-gray-400 mb-2 font-medium uppercase tracking-wider text-xs">Implied Share Price</p>
                    <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                        {formatCurrency(result.share_price)}
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                        <p>Enterprise Value: <span className="text-gray-200">{formatCurrency(result.enterprise_value)}</span></p>
                        <p>Equity Value: <span className="text-gray-200">{formatCurrency(result.equity_value)}</span></p>
                    </div>
                </div>

                {/* Sensitivity Analysis */}
                <div className="flex-[2] overflow-x-auto">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex justify-between">
                        <span>Sensitivity Analysis</span>
                        <span className="text-xs font-normal text-gray-500">WACC vs. Term. Growth</span>
                    </h4>
                    <div className="text-xs">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 bg-gray-700/50 text-gray-400 rounded-tl-lg border-b border-gray-600">WACC \ g</th>
                                    {Object.keys(Object.values(result.sensitivity_analysis)[0]).map(g => (
                                        <th key={g} className="p-2 bg-gray-700/50 text-gray-300 font-medium border-b border-gray-600">{g}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(result.sensitivity_analysis).map(([wacc, row]) => (
                                    <tr key={wacc} className="border-b border-gray-700/50 last:border-0 hover:bg-white/5 transition-colors">
                                        <td className="p-2 font-medium text-gray-300 bg-gray-700/30 border-r border-gray-700/50">{wacc}</td>
                                        {Object.values(row).map((price, i) => (
                                            <td key={i} className={`p-2 font-mono ${price > result.share_price ? 'text-green-400' : 'text-red-400'}`}>
                                                {formatCurrency(price)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center flex justify-center gap-6">
                <span>WACC: <span className="text-gray-300">{(assumptions.wacc * 100).toFixed(1)}%</span></span>
                <span>Terminal Growth: <span className="text-gray-300">{(assumptions.terminal_growth_rate * 100).toFixed(1)}%</span></span>
                <span>Tax Rate: <span className="text-gray-300">{(assumptions.tax_rate * 100).toFixed(1)}%</span></span>
                {exchangeRate !== 1 && <span>Original Currency: {currency} (Ex. Rate: <span className="text-gray-300">{exchangeRate.toFixed(4)}</span>)</span>}
            </div>
        </div>
    );
};
