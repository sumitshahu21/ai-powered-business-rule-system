import { Rule } from './types';

// In-memory store for rules (will be replaced with database later)
let rulesStore: Rule[] = [];

export async function fetchRules(): Promise<Rule[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...rulesStore];
}

export async function createRule(rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
  const newRule: Rule = {
    ...rule,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  rulesStore.push(newRule);
  return newRule;
}

export async function updateRule(updatedRule: Rule): Promise<Rule> {
  const index = rulesStore.findIndex(rule => rule.id === updatedRule.id);
  if (index === -1) {
    throw new Error('Rule not found');
  }
  
  const updated = {
    ...updatedRule,
    updatedAt: new Date(),
  };
  
  rulesStore[index] = updated;
  return updated;
}

export async function deleteRule(ruleId: string): Promise<void> {
  const index = rulesStore.findIndex(rule => rule.id === ruleId);
  if (index === -1) {
    throw new Error('Rule not found');
  }
  
  rulesStore.splice(index, 1);
}

export async function getRuleById(ruleId: string): Promise<Rule | null> {
  const rule = rulesStore.find(rule => rule.id === ruleId);
  return rule || null;
}

// Simple ID generator
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
