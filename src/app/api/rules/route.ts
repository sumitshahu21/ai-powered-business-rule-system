import { NextResponse } from 'next/server';
import { fetchRules, createRule, updateRule, deleteRule } from '@/lib/rules';

export async function GET() {
    try {
        const rules = await fetchRules();
        return NextResponse.json(rules);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const ruleData = await request.json();
        const newRule = await createRule(ruleData);
        return NextResponse.json(newRule, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const updatedRule = await request.json();
        const result = await updateRule(updatedRule);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await deleteRule(id);
        return NextResponse.json({ message: 'Rule deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
    }
}