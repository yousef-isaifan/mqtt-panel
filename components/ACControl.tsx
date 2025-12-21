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

    try {
      const response = await fetch('/api/ac/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setState((prev) => ({ ...prev, ...command }));
      } else {
        setError(data.error);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to send command');
      console.error('Failed to control AC:', error);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">
        AC Control - Living Room
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Power Control */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Power
          </label>
          <button
            onClick={togglePower}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              state.power === 'ON'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {state.power === 'ON' ? '🟢 ON' : '⚫ OFF'}
          </button>
        </div>

        {/* Temperature Control */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Temperature: {state.temperature}°C
          </label>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setTemperature(state.temperature - 1)}
              disabled={loading || state.temperature <= 16}
              className="px-3 py-2 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
              className="flex-1"
            />
            <button
              onClick={() => setTemperature(state.temperature + 1)}
              disabled={loading || state.temperature >= 30}
              className="px-3 py-2 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              +
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>16°C</span>
            <span>30°C</span>
          </div>
        </div>

        {/* Fan Speed Control */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Fan Speed
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['auto', 'low', 'medium', 'high'] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setFanSpeed(speed)}
                disabled={loading}
                className={`py-2 px-3 rounded font-medium transition-colors ${
                  state.fan_speed === speed
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {speed.charAt(0).toUpperCase() + speed.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Quick Actions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => sendCommand({ power: 'ON', temperature: 22, fan_speed: 'auto' })}
              disabled={loading}
              className="py-2 px-2 sm:px-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded disabled:opacity-50 text-sm sm:text-base"
            >
              ❄️ Cool (22°C)
            </button>
            <button
              onClick={() => sendCommand({ power: 'ON', temperature: 26, fan_speed: 'low' })}
              disabled={loading}
              className="py-2 px-2 sm:px-3 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-50 text-sm sm:text-base"
            >
              🌡️ Warm (26°C)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
