import { NextRequest, NextResponse } from 'next/server';
import { publishACCommand } from '@/lib/mqtt-service';

export const dynamic = 'force-dynamic';

interface ACCommand {
  power?: 'ON' | 'OFF';
  temperature?: number;
  fan_speed?: 'low' | 'medium' | 'high' | 'auto';
}

export async function POST(request: NextRequest) {
  try {
    const body: ACCommand = await request.json();
    console.log('[AC API] Received command:', body);

    // Validate temperature if provided
    if (body.temperature !== undefined) {
      if (body.temperature < 16 || body.temperature > 30) {
        return NextResponse.json(
          { success: false, error: 'Temperature must be between 16 and 30°C' },
          { status: 400 }
        );
      }
    }

    // Validate fan_speed if provided
    if (body.fan_speed && !['low', 'medium', 'high', 'auto'].includes(body.fan_speed)) {
      return NextResponse.json(
        { success: false, error: 'Invalid fan speed. Must be: low, medium, high, or auto' },
        { status: 400 }
      );
    }

    // Validate power if provided
    if (body.power && !['ON', 'OFF'].includes(body.power)) {
      return NextResponse.json(
        { success: false, error: 'Power must be ON or OFF' },
        { status: 400 }
      );
    }

    // At least one parameter must be provided
    if (!body.power && body.temperature === undefined && !body.fan_speed) {
      return NextResponse.json(
        { success: false, error: 'At least one parameter (power, temperature, fan_speed) is required' },
        { status: 400 }
      );
    }

    console.log('[AC API] Publishing MQTT command...');
    await publishACCommand(body);
    console.log('[AC API] Command published successfully');

    return NextResponse.json({
      success: true,
      message: 'AC command sent successfully',
      command: body,
    });
  } catch (error) {
    console.error('[AC API] Failed to control AC:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: `Failed to control AC: ${errorMessage}` },
      { status: 500 }
    );
  }
}
