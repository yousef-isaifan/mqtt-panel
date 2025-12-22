'use client';

import { useState, useEffect } from 'react';

interface ACState {
  power: 'ON' | 'OFF';
  temperature: number;
  fan_speed: 'low' | 'medium' | 'high' | 'auto';
}

export default function ACControl() {
  const [state, setState] = useState<ACState>({
    power: 'OFF',
    temperature: 24,
    fan_speed: 'auto',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch current AC state
  const fetchACState = async () => {
    try {
      const response = await fetch('/api/devices/status');
      const data = await response.json();
      
      if (data.success && data.ac) {
        setState({
          power: data.ac.power || 'OFF',
          temperature: data.ac.temperature || 24,
          fan_speed: data.ac.fan_speed || 'auto',
        });
      }
    } catch (error) {
      console.error('Failed to fetch AC state:', error);
    }
  };

  // Fetch state on mount and poll every 3 seconds
  useEffect(() => {
    fetchACState();
    const interval = setInterval(fetchACState, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendCommand = async (command: Partial<ACState>) => {
    setLoading(true);
    setError('');

    console.log('[ACControl] Sending command:', command);

    try {
      const response = await fetch('/api/ac/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      console.log('[ACControl] Response status:', response.status);
      const data = await response.json();
      console.log('[ACControl] Response data:', data);

      if (data.success) {
        // Update local state
        setState((prev) => ({ ...prev, ...command }));
        console.log('[ACControl] State updated to:', { ...state, ...command });
      } else {
        setError(data.error);
        console.error('[ACControl] Error from API:', data.error);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to send command');
      console.error('[ACControl] Failed to control AC:', error);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const togglePower = () => {
    const newPower = state.power === 'ON' ? 'OFF' : 'ON';
    sendCommand({ power: newPower });
  };

  const setTemperature = (temp: number) => {
    if (temp >= 16 && temp <= 30) {
      sendCommand({ temperature: temp });
    }
  };

  const setFanSpeed = (speed: ACState['fan_speed']) => {
    sendCommand({ fan_speed: speed });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Header with Power Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            state.power === 'ON' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-500'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Air Conditioner</h3>
            <p className={`text-xs ${state.power === 'ON' ? 'text-blue-400' : 'text-gray-500'}`}>
              {state.power === 'ON' ? 'Running' : 'Standby'}
            </p>
          </div>
        </div>
        <button
          onClick={togglePower}
          disabled={loading}
          className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-colors ${
            state.power === 'ON'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Processing...' : state.power === 'ON' ? 'Turn Off' : 'Turn On'}
        </button>
      </div>

      {/* Temperature Display and Control */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-400">Target Temperature</div>
          <div className="text-3xl font-bold text-white">
            {state.temperature}°C
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTemperature(state.temperature - 1)}
            disabled={loading || state.temperature <= 16}
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <input
            type="range"
            min="16"
            max="30"
            value={state.temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
            disabled={loading}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <button
            onClick={() => setTemperature(state.temperature + 1)}
            disabled={loading || state.temperature >= 30}
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>16°C</span>
          <span>30°C</span>
        </div>
      </div>

      {/* Fan Speed and Quick Presets in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:divide-x divide-gray-600">
        {/* Fan Speed Control */}
        <div className="sm:pr-4">
          <label className="text-sm font-medium text-gray-400 mb-2 block">Fan Speed</label>
          <div className="grid grid-cols-2 gap-2">
            {(['low', 'medium', 'high', 'auto'] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setFanSpeed(speed)}
                disabled={loading}
                className={`py-2 px-2 rounded-lg font-medium text-xs transition-colors ${
                  state.fan_speed === speed
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {speed.charAt(0).toUpperCase() + speed.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="sm:pl-4">
          <label className="text-sm font-medium text-gray-400 mb-2 block">Quick Settings</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => sendCommand({ power: 'ON', temperature: 18, fan_speed: 'high' })}
              disabled={loading}
              className="py-5 px-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-sm">18°C</span>
              <span className="text-[10px] text-gray-500">High</span>
            </button>
            <button
              onClick={() => sendCommand({ power: 'ON', temperature: 24, fan_speed: 'auto' })}
              disabled={loading}
              className="py-5 px-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-sm">24°C</span>
              <span className="text-[10px] text-gray-500">Auto</span>
            </button>
            <button
              onClick={() => sendCommand({ power: 'ON', temperature: 26, fan_speed: 'low' })}
              disabled={loading}
              className="py-5 px-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-sm">26°C</span>
              <span className="text-[10px] text-gray-500">Low</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
