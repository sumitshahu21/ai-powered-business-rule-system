import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

export async function GET() {
  try {
    console.log('🧪 Testing AI connection...');
    console.log('🔑 API Key exists:', !!process.env.AI_API_KEY);
    console.log('🔑 API Key length:', process.env.AI_API_KEY?.length || 0);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with a simple confirmation."
        },
        {
          role: "user",
          content: "Say 'AI connection successful' if you can see this message."
        }
      ],
      temperature: 0.1,
      max_tokens: 50
    });

    const response = completion.choices[0]?.message?.content || 'No response';
    console.log('🧪 AI Test Response:', response);

    return NextResponse.json({ 
      success: true, 
      response,
      model: completion.model,
      usage: completion.usage
    }, { status: 200 });
  } catch (error) {
    console.error('🧪 AI Test Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
