'use client';

import { useDeviceStatus, useTemperatureHistory, useMqttStatus } from '@/lib/hooks';
import TemperatureChart from '@/components/TemperatureChart';
import LightControl from '@/components/LightControl';
import { format } from 'date-fns';

export default function Home() {
  const { data: deviceStatus, loading: statusLoading, refresh: refreshDeviceStatus } = useDeviceStatus();
  const { data: tempHistory, loading: historyLoading } = useTemperatureHistory(24);
  const { data: mqttStatus } = useMqttStatus();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">MQTT Dashboard</h1>
              <p className="text-gray-400 mt-1">Real-time Device Monitoring & Control</p>
            </div>
            
            {/* MQTT Connection Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                mqttStatus?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {mqttStatus?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Temperature Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-200">Temperature Sensor</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                deviceStatus?.temperature?.availability === 'online'
                  ? 'bg-green-900 text-green-300'
                  : 'bg-red-900 text-red-300'
              }`}>
                {deviceStatus?.temperature?.availability || 'unknown'}
              </div>
            </div>
            
            {statusLoading ? (
              <div className="animate-pulse">
                <div className="h-16 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : deviceStatus?.temperature ? (
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-green-400">
                    {deviceStatus.temperature.value.toFixed(1)}
                  </span>
                  <span className="text-2xl text-gray-400">°{deviceStatus.temperature.unit === 'celsius' ? 'C' : 'F'}</span>
                </div>
                <p className="text-sm text-gray-400">
                  Living Room · Last updated: {format(new Date(deviceStatus.temperature.timestamp), 'HH:mm:ss')}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
          </div>

          {/* Light Control Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-200">Smart Light</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                deviceStatus?.light?.availability === 'online'
                  ? 'bg-green-900 text-green-300'
                  : 'bg-red-900 text-red-300'
              }`}>
                {deviceStatus?.light?.availability || 'unknown'}
              </div>
            </div>
            
            {statusLoading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            ) : deviceStatus?.light ? (
              <LightControl 
                currentState={deviceStatus.light.state}
                availability={deviceStatus.light.availability}
                onRefresh={refreshDeviceStatus}
              />
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
          </div>
        </div>

        {/* Temperature History Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200 mb-6">Temperature History (24 Hours)</h2>
          
          {historyLoading ? (
            <div className="animate-pulse h-[300px] bg-gray-700 rounded"></div>
          ) : tempHistory.length > 0 ? (
            <TemperatureChart data={tempHistory} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No historical data available
            </div>
          )}
        </div>

        {/* Device Topics Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">MQTT Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Temperature Sensor</h3>
              <ul className="space-y-1 text-gray-400">
                <li className="font-mono">• smarthome/sensor/temperature/living_room/state</li>
                <li className="font-mono">• smarthome/sensor/temperature/living_room/availability</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Smart Light</h3>
              <ul className="space-y-1 text-gray-400">
                <li className="font-mono">• smarthome/light/living_room/state</li>
                <li className="font-mono">• smarthome/light/living_room/command</li>
                <li className="font-mono">• smarthome/light/living_room/availability</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>MQTT Dashboard · Real-time Monitoring</p>
            <p className="mt-1">Monitor and control your smart home devices</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

