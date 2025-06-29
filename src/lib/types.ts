export interface Rule {
  id: string;
  original: string;    // Plain English
  parsed: object;      // Structured logic (e.g., JSON)
  priority: number;
  weight: number;
  status: 'valid' | 'error' | 'warning'; // Analyzed by AI
  suggestions: string[]; // AI-generated recommendations
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleValidation {
  valid: boolean;
  conflicts: string[];
  suggestions: string[];
}

export interface RuleRecommendation {
  rule: string;
  confidence: number;
  reasoning: string;
}
