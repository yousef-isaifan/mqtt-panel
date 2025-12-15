'use client';

import { useEffect, useState } from 'react';

export interface DeviceStatus {
  temperature: {
    value: number;
    unit: string;
    timestamp: string;
    availability: string;
  } | null;
  light: {
    state: string;
    brightness?: number;
    color?: string;
    timestamp: string;
    availability: string;
  } | null;
}

export interface TemperatureHistory {
  temperature: number;
  unit: string;
  timestamp: string;
}

export interface MqttStatus {
  connected: boolean;
  status: string;
  lastUpdate: string | null;
  message: string | null;
}

export function useDeviceStatus(refreshInterval: number = 2000) {
  const [data, setData] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/devices/status');
        if (!response.ok) throw new Error('Failed to fetch device status');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch device status');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error };
}

export function useTemperatureHistory(hours: number = 24) {
  const [data, setData] = useState<TemperatureHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/temperature/history?hours=${hours}`);
        if (!response.ok) throw new Error('Failed to fetch temperature history');
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch temperature history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [hours]);

  return { data, loading, error };
}

export function useMqttStatus(refreshInterval: number = 3000) {
  const [data, setData] = useState<MqttStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mqtt/status');
        if (!response.ok) throw new Error('Failed to fetch MQTT status');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch MQTT status');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error };
}

export async function controlLight(command: 'ON' | 'OFF') {
  const response = await fetch('/api/light/control', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ command }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to control light');
  }

  return response.json();
}
