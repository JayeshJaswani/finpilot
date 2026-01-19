interface LoaderProps {
  progress: number;
  stage: string;
}

export const Loader: React.FC<LoaderProps> = ({ progress, stage }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 w-full max-w-lg mx-auto">
      <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden border border-gray-600">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between w-full text-sm text-gray-400 mb-2 font-mono">
        <span>{stage}</span>
        <span>{progress}%</span>
      </div>
      <p className="text-gray-500 text-xs animate-pulse">Initializing AI Models...</p>
    </div>
  );
};
