import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AnalysisResult } from '../types';

export const exportToCSV = (data: AnalysisResult) => {
    const flattenObject = (obj: any, prefix = ''): any => {
        return Object.keys(obj).reduce((acc: any, k: string) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, flattenObject(obj[k], pre + k));
            } else if (Array.isArray(obj[k])) {
                acc[pre + k] = JSON.stringify(obj[k]);
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    };

    const flattenedData = flattenObject(data);
    const headers = Object.keys(flattenedData).join(',');
    const values = Object.values(flattenedData).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');

    const csvContent = `${headers}\n${values}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${data.companyName}_Analysis.csv`);
};

export const exportToExcel = (data: AnalysisResult) => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        ['Company', data.companyName],
        ['Ticker', data.tickerSymbol || 'N/A'],
        ['Currency', data.currency],
        ['Year', data.mostRecentYear],
        ['Revenue', data.financialsLocal.revenue],
        ['COGS', data.financialsLocal.cogs],
        ['OpEx', data.financialsLocal.opex],
        ['Gross Margin %', data.analysis.ratioAnalysis.profitability.grossMarginPercent],
        ['Operating Margin %', data.analysis.ratioAnalysis.profitability.operatingMarginPercent],
        ['Recommendation', data.investmentRecommendation?.action || 'N/A'],
        ['Justification', data.investmentRecommendation?.justification || 'N/A']
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Ratios Sheet
    const ratioData = [
        ['Category', 'Metric', 'Value'],
        ['Liquidity', 'Current Ratio', data.analysis.ratioAnalysis.liquidity.currentRatio],
        ['Profitability', 'Gross Margin %', data.analysis.ratioAnalysis.profitability.grossMarginPercent],
        ['Profitability', 'Operating Margin %', data.analysis.ratioAnalysis.profitability.operatingMarginPercent],
        ['Profitability', 'Net Profit Margin %', data.analysis.ratioAnalysis.profitability.netProfitMarginPercent],
        ['Debt', 'Debt-to-Equity', data.analysis.ratioAnalysis.debt.debtToEquity],
        ['Efficiency', 'Asset Turnover', data.analysis.ratioAnalysis.efficiency.assetTurnover]
    ];
    const ratiosWs = XLSX.utils.aoa_to_sheet(ratioData);
    XLSX.utils.book_append_sheet(wb, ratiosWs, "Ratios");

    // News Sheet
    if (data.analysis.newsAnalysis?.events) {
        const newsHeader = [['Date', 'Title', 'Source', 'Summary']];
        const newsRows = data.analysis.newsAnalysis.events.map(e => [e.date, e.title, e.source, e.summary]);
        const newsWs = XLSX.utils.aoa_to_sheet([...newsHeader, ...newsRows]);
        XLSX.utils.book_append_sheet(wb, newsWs, "News");
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${data.companyName}_Analysis.xlsx`);
};

export const exportToPDF = (data: AnalysisResult) => {
    const doc = new jsPDF();
    const margin = 14;
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text(`${data.companyName} (${data.tickerSymbol || 'N/A'}) - Financial Analysis`, margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Recommendation Section
    if (data.investmentRecommendation) {
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Investment Recommendation", margin, yPos);
        yPos += 8;

        const recColor = data.investmentRecommendation.action === 'Buy' ? [46, 204, 113] :
            data.investmentRecommendation.action === 'Sell' ? [231, 76, 60] : [243, 156, 18];

        doc.setFontSize(16);
        doc.setTextColor(recColor[0], recColor[1], recColor[2]);
        doc.text(data.investmentRecommendation.action.toUpperCase(), margin, yPos);

        doc.setFontSize(10);
        doc.setTextColor(0);
        const splitJustification = doc.splitTextToSize(data.investmentRecommendation.justification, 180);
        doc.text(splitJustification, margin + 25, yPos);
        yPos += splitJustification.length * 5 + 10;
    }

    // Financial Summary Table
    doc.setFontSize(14);
    doc.text("Financial Summary", margin, yPos);
    yPos += 5;

    autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value', 'Unit']],
        body: [
            ['Revenue', data.financialsLocal.revenue.toLocaleString(), data.financialsLocal.unit],
            ['COGS', data.financialsLocal.cogs.toLocaleString(), data.financialsLocal.unit],
            ['OpEx', data.financialsLocal.opex.toLocaleString(), data.financialsLocal.unit]
        ],
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Ratios Table
    doc.setFontSize(14);
    doc.text("Key Ratios", margin, yPos);
    yPos += 5;

    autoTable(doc, {
        startY: yPos,
        head: [['Ratio', 'Value']],
        body: [
            ['Current Ratio', data.analysis.ratioAnalysis.liquidity.currentRatio?.toFixed(2) || 'N/A'],
            ['Gross Margin', (data.analysis.ratioAnalysis.profitability.grossMarginPercent?.toFixed(2) + '%') || 'N/A'],
            ['Operating Margin', (data.analysis.ratioAnalysis.profitability.operatingMarginPercent?.toFixed(2) + '%') || 'N/A'],
            ['Debt-to-Equity', data.analysis.ratioAnalysis.debt.debtToEquity?.toFixed(2) || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // News Summary
    if (data.analysis.newsAnalysis) {
        // Check for page break
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.text("Latest News Analysis", margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        const summaryText = doc.splitTextToSize(data.analysis.newsAnalysis.summary, 180);
        doc.text(summaryText, margin, yPos);
        yPos += summaryText.length * 5 + 10;

        if (data.analysis.newsAnalysis.events.length > 0) {
            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Headline', 'Source']],
                body: data.analysis.newsAnalysis.events.map(e => [e.date, e.title, e.source]),
                columnStyles: { 1: { cellWidth: 90 } },
                theme: 'plain'
            });
        }
    }

    doc.save(`${data.companyName}_Report.pdf`);
};
