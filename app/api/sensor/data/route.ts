import { NextRequest, NextResponse } from 'next/server';
import { insertTemperatureReading } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_id, temperature, unit } = body;

    if (!device_id || temperature === undefined) {
      return NextResponse.json(
        { error: 'device_id and temperature are required' },
        { status: 400 }
      );
    }

    if (typeof temperature !== 'number' || isNaN(temperature)) {
      return NextResponse.json(
        { error: 'temperature must be a valid number' },
        { status: 400 }
      );
    }

    await insertTemperatureReading(device_id, temperature, unit || 'celsius');

    return NextResponse.json({
      success: true,
      message: 'Temperature reading stored successfully',
      data: { device_id, temperature, unit: unit || 'celsius' },
    });
  } catch (error) {
    console.error('Error storing sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to store sensor data' },
      { status: 500 }
    );
  }
}
