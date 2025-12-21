import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch specific rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await query(
      'SELECT * FROM automation_rules WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rule: result.rows[0],
    });
  } catch (error) {
    console.error('Failed to fetch automation rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automation rule' },
      { status: 500 }
    );
  }
}

// PUT - Update automation rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      enabled,
      condition_type,
      condition_device_id,
      condition_value,
      action_type,
      action_device_id,
      action_payload,
    } = body;

    const result = await query(
      `UPDATE automation_rules 
       SET name = $1, description = $2, enabled = $3, condition_type = $4, 
           condition_device_id = $5, condition_value = $6, action_type = $7, 
           action_device_id = $8, action_payload = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        name,
        description,
        enabled,
        condition_type,
        condition_device_id,
        String(condition_value),
        action_type,
        action_device_id,
        JSON.stringify(action_payload),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rule: result.rows[0],
    });
  } catch (error) {
    console.error('Failed to update automation rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update automation rule' },
      { status: 500 }
    );
  }
}

// DELETE - Delete automation rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await query(
      'DELETE FROM automation_rules WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Rule deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete automation rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete automation rule' },
      { status: 500 }
    );
  }
}
