import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from '@/lib/init';

let initPromise: Promise<void> | null = null;

export async function GET(request: NextRequest) {
  try {
    if (!initPromise) {
      initPromise = initializeApp();
    }
    
    await initPromise;
    
    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully',
    });
  } catch (error: any) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize application' },
      { status: 500 }
    );
  }
}
