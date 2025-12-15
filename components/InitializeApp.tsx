'use client';

import { useEffect, useState } from 'react';

export default function InitializeApp({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch('/api/init');
        if (!response.ok) {
          throw new Error('Failed to initialize application');
        }
        setInitialized(true);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message);
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Initialization Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-300 text-lg">Initializing MQTT Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Connecting to broker and loading devices</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
