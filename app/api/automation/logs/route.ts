import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch automation logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('rule_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `
      SELECT 
        al.*,
        ar.name as rule_name
      FROM automation_logs al
      LEFT JOIN automation_rules ar ON al.rule_id = ar.id
    `;

    const params: any[] = [];
    
    if (ruleId) {
      sql += ' WHERE al.rule_id = $1';
      params.push(ruleId);
    }

    sql += ' ORDER BY al.triggered_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      logs: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch automation logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automation logs' },
      { status: 500 }
    );
  }
}
