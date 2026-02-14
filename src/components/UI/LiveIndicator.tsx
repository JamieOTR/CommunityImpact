import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

interface LiveIndicatorProps {
  isConnected: boolean;
}

export default function LiveIndicator({ isConnected }: LiveIndicatorProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setPulse(prev => !prev);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
      <div className="relative">
        <Radio
          className={`w-3.5 h-3.5 transition-colors ${
            isConnected ? 'text-green-600' : 'text-slate-400'
          }`}
        />
        {isConnected && (
          <span
            className={`absolute inset-0 rounded-full bg-green-400 transition-opacity duration-700 ${
              pulse ? 'opacity-0 scale-150' : 'opacity-30 scale-100'
            }`}
          />
        )}
      </div>
      <span className={`text-xs font-medium ${
        isConnected ? 'text-green-700' : 'text-slate-500'
      }`}>
        {isConnected ? 'Live' : 'Connecting...'}
      </span>
    </div>
  );
}
