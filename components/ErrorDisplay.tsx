import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-red-900/20 border border-red-500/50 rounded-lg">
      <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
      <p className="mt-2 text-red-300/80 max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
      >
        Try Again
      </button>
    </div>
  );
};
