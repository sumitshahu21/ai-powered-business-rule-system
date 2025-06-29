import { NextResponse } from 'next/server';
import { parseRule } from '@/lib/ai';

export async function POST(request: Request) {
  const { rule } = await request.json();

  if (!rule) {
    return NextResponse.json({ error: 'Rule is required' }, { status: 400 });
  }

  try {
    const parsedRule = await parseRule(rule);
    return NextResponse.json({ parsed: parsedRule }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse rule' }, { status: 500 });
  }
}