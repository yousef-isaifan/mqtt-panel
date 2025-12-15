import { NextRequest, NextResponse } from 'next/server';
import { publishLightCommand } from '@/lib/mqtt-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command } = body;

    if (!command || (command !== 'ON' && command !== 'OFF')) {
      return NextResponse.json(
        { error: 'command must be either "ON" or "OFF"' },
        { status: 400 }
      );
    }

    await publishLightCommand(command);

    return NextResponse.json({
      success: true,
      message: `Light command ${command} sent successfully`,
      command,
    });
  } catch (error: any) {
    console.error('Error controlling light:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to control light' },
      { status: 500 }
    );
  }
}
