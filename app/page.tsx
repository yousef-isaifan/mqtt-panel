'use client';

import { useDeviceStatus, useTemperatureHistory, useMqttStatus } from '@/lib/hooks';
import TemperatureChart from '@/components/TemperatureChart';
import LightControl from '@/components/LightControl';
import ACControl from '@/components/ACControl';
import AutomationManager from '@/components/AutomationManager';
import SignOutButton from '@/components/SignOutButton';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: deviceStatus, loading: statusLoading, refresh: refreshDeviceStatus } = useDeviceStatus();
  const { data: tempHistory, loading: historyLoading } = useTemperatureHistory(24);
  const { data: mqttStatus } = useMqttStatus();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                🏠 Smart Home Dashboard
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Real-time monitoring & automation control
                {session?.user?.name && (
                  <span className="ml-2 text-cyan-400">• Welcome, {session.user.name}</span>
                )}
              </p>
            </div>
            
            {/* Right side: MQTT Status and Sign Out */}
            <div className="flex items-center gap-3">
              {/* MQTT Connection Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
                mqttStatus?.connected 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  mqttStatus?.connected ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-red-400'
                }`} />
                <span className={`text-xs sm:text-sm font-medium ${
                  mqttStatus?.connected ? 'text-green-300' : 'text-red-300'
                }`}>
                  {mqttStatus?.connected ? 'MQTT Connected' : 'MQTT Offline'}
                </span>
              </div>
              
              {/* Sign Out Button */}
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Status Cards Row */}
        <div className="space-y-4 sm:space-y-6">
          {/* Temperature and Light Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Temperature Card */}
            <div className="group bg-gradient-to-br from-gray-800/90 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl">
                  🌡️
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-200">Temperature</h2>
                  <p className="text-xs text-gray-500">Living Room</p>
                </div>
              </div>
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                deviceStatus?.temperature?.availability === 'online'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {deviceStatus?.temperature?.availability === 'online' ? '● Online' : '○ Offline'}
              </div>
            </div>
            
            {statusLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-gray-700/50 rounded-lg"></div>
                <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
              </div>
            ) : deviceStatus?.temperature ? (
              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {deviceStatus.temperature.value.toFixed(1)}
                  </span>
                  <span className="text-xl sm:text-2xl text-gray-400">°{deviceStatus.temperature.unit === 'celsius' ? 'C' : 'F'}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Updated {format(new Date(deviceStatus.temperature.timestamp), 'HH:mm:ss')}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>

          {/* Light Control Card */}
          <div className="group bg-gradient-to-br from-gray-800/90 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xl">
                  💡
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-200">Smart Light</h2>
                  <p className="text-xs text-gray-500">Living Room</p>
                </div>
              </div>
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                deviceStatus?.light?.availability === 'online'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {deviceStatus?.light?.availability === 'online' ? '● Online' : '○ Offline'}
              </div>
            </div>
            
            {statusLoading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-700/50 rounded-lg"></div>
              </div>
            ) : deviceStatus?.light ? (
              <LightControl 
                currentState={deviceStatus.light.state}
                availability={deviceStatus.light.availability}
                onRefresh={refreshDeviceStatus}
              />
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>
        </div>

          {/* AC Control Card - Full Width */}
          <div className="group bg-gradient-to-br from-gray-800/90 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
                ❄️
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-200">Air Conditioner</h2>
                <p className="text-xs text-gray-500">Living Room</p>
              </div>
            </div>
            <ACControl />
          </div>
        </div>

        {/* Automation Manager */}
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <AutomationManager />
        </div>

        {/* Temperature History Chart */}
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
              📊
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-200">Temperature History</h2>
              <p className="text-xs text-gray-500">Last 24 hours</p>
            </div>
          </div>
          
          {historyLoading ? (
            <div className="animate-pulse h-[300px] bg-gray-700/30 rounded-lg"></div>
          ) : tempHistory.length > 0 ? (
            <TemperatureChart data={tempHistory} />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-2">📈</span>
              <p>No historical data available</p>
            </div>
          )}
        </div>

        {/* Device Topics Info */}
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-lg">
              📡
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-200">MQTT Topics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌡️</span>
                <h3 className="font-medium text-gray-300 text-sm">Temperature Sensor</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-400 bg-gray-900/50 rounded-lg p-3">
                <li className="font-mono break-all">• .../temperature/.../state</li>
                <li className="font-mono break-all">• .../temperature/.../availability</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h3 className="font-medium text-gray-300 text-sm">Smart Light</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-400 bg-gray-900/50 rounded-lg p-3">
                <li className="font-mono break-all">• .../light/.../state</li>
                <li className="font-mono break-all">• .../light/.../command</li>
                <li className="font-mono break-all">• .../light/.../availability</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">❄️</span>
                <h3 className="font-medium text-gray-300 text-sm">Smart AC</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-400 bg-gray-900/50 rounded-lg p-3">
                <li className="font-mono break-all">• .../ac/.../state</li>
                <li className="font-mono break-all">• .../ac/.../command</li>
                <li className="font-mono break-all">• .../ac/.../availability</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/30 backdrop-blur-sm border-t border-gray-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            <p className="font-medium">🏠 Smart Home Dashboard</p>
            <p className="mt-1">Powered by MQTT · Real-time automation control</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

