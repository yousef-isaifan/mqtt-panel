'use client';

import { useState, useEffect, useRef } from 'react';
import { controlLight } from '@/lib/hooks';

interface LightControlProps {
  currentState: string;
  availability: string;
  onRefresh?: () => void;
}

export default function LightControl({ currentState, availability, onRefresh }: LightControlProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const prevStateRef = useRef(currentState);

  const isOn = currentState === 'ON';
  const isAvailable = availability === 'online';

  // Detect when state actually changes from the backend
  useEffect(() => {
    if (prevStateRef.current !== currentState && loading && lastCommand) {
      // State changed to match our command, stop loading
      if (currentState === lastCommand) {
        setLoading(false);
        setLastCommand(null);
        if (cooldownTimer.current) {
          clearTimeout(cooldownTimer.current);
        }
      }
    }
    prevStateRef.current = currentState;
  }, [currentState, loading, lastCommand]);

  const handleToggle = async () => {
    // Prevent double clicks
    if (loading) return;

    setLoading(true);
    setError(null);
    
    const command = isOn ? 'OFF' : 'ON';
    setLastCommand(command);

    try {
      await controlLight(command, onRefresh);
      
      // Trigger immediate status refresh
      if (onRefresh) {
        onRefresh();
      }
      
      // Safety cooldown: force stop loading after 2 seconds even if state doesn't change
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
      cooldownTimer.current = setTimeout(() => {
        setLoading(false);
        setLastCommand(null);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setLastCommand(null);
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-200">Living Room Light</h3>
          <p className="text-sm text-gray-400">
            Status: <span className={isOn ? 'text-green-400' : 'text-gray-400'}>{currentState}</span>
          </p>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={loading || !isAvailable}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isOn
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            <>
              {isOn ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                  Turn OFF
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  Turn ON
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {!isAvailable && (
        <div className="text-sm text-orange-400 bg-orange-900/20 px-3 py-2 rounded">
          Device is currently offline
        </div>
      )}
    </div>
  );
}
