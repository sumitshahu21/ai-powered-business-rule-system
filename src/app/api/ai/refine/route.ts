import { NextResponse } from 'next/server';
import { refineRule } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { rule } = await request.json();

    if (!rule) {
      return NextResponse.json({ error: 'Rule is required' }, { status: 400 });
    }

    console.log('🚀 API: Refining rule:', rule);
    const refinement = await refineRule(rule);
    console.log('✅ API: Refinement result:', refinement);
    
    return NextResponse.json({ refinement }, { status: 200 });
  } catch (error) {
    console.error('❌ API: Error refining rule:', error);
    return NextResponse.json({ error: 'Failed to refine rule' }, { status: 500 });
  }
}
