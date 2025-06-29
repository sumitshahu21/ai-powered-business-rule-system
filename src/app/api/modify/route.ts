import { NextResponse } from 'next/server';
import { modifyRule } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { instruction, currentRule } = await request.json();

    if (!instruction || !currentRule) {
      return NextResponse.json({ error: 'Instruction and current rule are required' }, { status: 400 });
    }

    const modifiedRule = await modifyRule(instruction, currentRule);
    return NextResponse.json({ modifiedRule }, { status: 200 });
  } catch (error) {
    console.error('Error modifying rule:', error);
    return NextResponse.json({ error: 'Failed to modify rule' }, { status: 500 });
  }
}