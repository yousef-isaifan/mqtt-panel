import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all automation rules
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        ar.*,
        d1.device_name as condition_device_name,
        d2.device_name as action_device_name
      FROM automation_rules ar
      LEFT JOIN devices d1 ON ar.condition_device_id = d1.device_id
      LEFT JOIN devices d2 ON ar.action_device_id = d2.device_id
      ORDER BY ar.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      rules: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch automation rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automation rules' },
      { status: 500 }
    );
  }
}

// POST - Create new automation rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      enabled = true,
      condition_type,
      condition_device_id,
      condition_value,
      action_type,
      action_device_id,
      action_payload,
    } = body;

    // Validate required fields
    if (!name || !condition_type || !condition_device_id || condition_value === undefined || 
        !action_type || !action_device_id || !action_payload) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO automation_rules 
       (name, description, enabled, condition_type, condition_device_id, condition_value, 
        action_type, action_device_id, action_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      ]
    );

    return NextResponse.json({
      success: true,
      rule: result.rows[0],
    });
  } catch (error) {
    console.error('Failed to create automation rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create automation rule' },
      { status: 500 }
    );
  }
}
