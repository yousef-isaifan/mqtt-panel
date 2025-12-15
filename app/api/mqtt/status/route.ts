import { NextRequest, NextResponse } from 'next/server';
import { getLatestConnectionStatus } from '@/lib/queries';
import { getMqttClient } from '@/lib/mqtt-service';

export async function GET(request: NextRequest) {
  try {
    const dbStatus = await getLatestConnectionStatus();
    const client = getMqttClient();
    
    const isConnected = client?.connected || false;
    
    return NextResponse.json({
      connected: isConnected,
      status: isConnected ? 'connected' : 'disconnected',
      lastUpdate: dbStatus?.timestamp || null,
      message: dbStatus?.message || null,
    });
  } catch (error) {
    console.error('Error fetching MQTT status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MQTT status' },
      { status: 500 }
    );
  }
}
