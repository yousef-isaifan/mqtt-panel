import { NextRequest, NextResponse } from 'next/server';
import { getTemperatureHistory } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24');
    
    const history = await getTemperatureHistory('temp_living_room', hours);

    return NextResponse.json({
      data: history.map(reading => ({
        temperature: reading.temperature,
        unit: reading.unit,
        timestamp: reading.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error fetching temperature history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temperature history' },
      { status: 500 }
    );
  }
}
