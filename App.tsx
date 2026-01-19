import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/SankeyDiagram';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useFinancialDataExtractor } from './hooks/useFinancialDataExtractor';
import type { AnalysisResult, GroundingSource } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { extractData } = useFinancialDataExtractor();

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (isLoading) return;

    setFile(selectedFile);
    setAnalysisResult(null);
    setGroundingSources([]);
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setStage('Initializing...');

    try {
      const { analysis, sources } = await extractData(selectedFile, (stageMsg, progressVal) => {
        setStage(stageMsg);
        setProgress(progressVal);
      });
      setAnalysisResult(analysis);
      setGroundingSources(sources);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during data extraction.';
      setError(`Failed to process the financial statement. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [extractData, isLoading]);

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setGroundingSources([]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-8">
          <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700 backdrop-blur-sm">
            {isLoading ? (
              <Loader progress={progress} stage={stage} />
            ) : error ? (
              <ErrorDisplay message={error} onRetry={handleReset} />
            ) : analysisResult ? (
              <AnalysisDashboard
                result={analysisResult}
                sources={groundingSources}
                onReset={handleReset}
                fileName={file?.name || 'your document'}
              />
            ) : (
              <FileUpload onFileSelect={handleFileSelect} />
            )}
          </div>
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Jayesh Jaswani. Powered by Gemini 2.5 Flash.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
