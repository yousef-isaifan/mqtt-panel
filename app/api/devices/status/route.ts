import { NextRequest, NextResponse } from 'next/server';
import { getLatestTemperature, getLatestDeviceState, getLatestAvailability } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    // Get latest temperature
    const temperature = await getLatestTemperature('temp_living_room');
    
    // Get latest light state
    const lightState = await getLatestDeviceState('light_living_room');
    
    // Get latest AC state
    const acState = await getLatestDeviceState('ac_living_room');
    
    // Get availability for all devices
    const tempAvailability = await getLatestAvailability('temp_living_room');
    const lightAvailability = await getLatestAvailability('light_living_room');
    const acAvailability = await getLatestAvailability('ac_living_room');

    return NextResponse.json({
      success: true,
      temperature: temperature ? {
        value: temperature.temperature,
        unit: temperature.unit,
        timestamp: temperature.timestamp,
        availability: tempAvailability?.availability || 'unknown',
      } : null,
      light: lightState ? {
        state: lightState.state,
        brightness: lightState.brightness,
        color: lightState.color,
        timestamp: lightState.timestamp,
        availability: lightAvailability?.availability || 'unknown',
      } : null,
      ac: acState ? {
        power: acState.state,
        temperature: acState.brightness, // Using brightness field for temperature
        fan_speed: acState.color, // Using color field for fan_speed
        timestamp: acState.timestamp,
        availability: acAvailability?.availability || 'unknown',
      } : null,
    });
  } catch (error) {
    console.error('Error fetching device status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device status' },
      { status: 500 }
    );
  }
}
