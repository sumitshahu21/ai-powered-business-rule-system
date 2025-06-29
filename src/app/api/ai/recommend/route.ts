import { NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { rule, existingRules } = await request.json();

    if (!rule) {
      return NextResponse.json({ error: 'Rule is required' }, { status: 400 });
    }

    const recommendations = await generateRecommendations(rule, existingRules || []);
    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}