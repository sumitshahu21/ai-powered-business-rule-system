import { useState } from 'react';
import { ParsedRule, RuleRefinement } from '../lib/ai';

export interface UseAIResult {
  parseRule: (rule: string) => Promise<ParsedRule>;
  validateRules: (rules: string[]) => Promise<{ valid: boolean; conflicts: string[]; suggestions: string[] }>;
  generateRecommendations: (rule: string, existingRules: string[]) => Promise<string[]>;
  refineRule: (rule: string) => Promise<RuleRefinement>;
  modifyRule: (instruction: string, currentRule: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export const useAI = (): UseAIResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseRule = async (rule: string): Promise<ParsedRule> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rule }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse rule');
      }

      const data = await response.json();
      return data.parsed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const validateRules = async (rules: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate rules');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async (rule: string, existingRules: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rule, existingRules }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      return data.recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refineRule = async (rule: string): Promise<RuleRefinement> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Hook: Calling refine API for rule:', rule);
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rule }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine rule');
      }

      const data = await response.json();
      console.log('✅ Hook: Refine API response:', data);
      return data.refinement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Hook: Error refining rule:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const modifyRule = async (instruction: string, currentRule: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instruction, currentRule }),
      });

      if (!response.ok) {
        throw new Error('Failed to modify rule');
      }

      const data = await response.json();
      return data.modifiedRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parseRule,
    validateRules,
    generateRecommendations,
    refineRule,
    modifyRule,
    isLoading,
    error,
  };
};

export default useAI;