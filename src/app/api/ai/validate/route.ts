import { NextResponse } from 'next/server';
import { validateRules } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { rules } = await request.json();

    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json({ error: 'Rules array is required' }, { status: 400 });
    }

    const validation = await validateRules(rules);
    return NextResponse.json(validation, { status: 200 });
  } catch (error) {
    console.error('Error validating rules:', error);
    return NextResponse.json({ error: 'Failed to validate rules' }, { status: 500 });
  }
}