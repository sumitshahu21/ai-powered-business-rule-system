'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRules } from '../hooks/useRules';
import { useAI } from '../hooks/useAI';
import { useToast } from '../hooks/useToast';
import { Loader2, Plus, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

const RuleInput: React.FC = () => {
  const [rule, setRule] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [refinement, setRefinement] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { rules, addRule } = useRules();
  const { parseRule, generateRecommendations, refineRule, validateRules, isLoading } = useAI();
  const { addToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRule(e.target.value);
    // Clear previous results when user types
    if (validationResult || recommendations.length > 0 || refinement) {
      setValidationResult(null);
      setRecommendations([]);
      setRefinement(null);
      setShowPreview(false);
    }
  };

  // Test AI connection
  const handleTestAI = async () => {
    try {
      console.log('🧪 Testing AI connection...');
      const response = await fetch('/api/test-ai');
      const data = await response.json();
      console.log('🧪 AI Test Result:', data);
      
      if (data.success) {
        addToast({
          type: 'success',
          message: `AI connection successful! Response: ${data.response}`,
          duration: 5000
        });
      } else {
        addToast({
          type: 'error',
          message: `AI connection failed: ${data.error}`,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('🧪 AI Test Error:', error);
      addToast({
        type: 'error',
        message: 'Failed to test AI connection',
        duration: 5000
      });
    }
  };

  // Manual validation and recommendation function
  const handleGetSuggestions = async () => {
    if (!rule.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setShowPreview(true);
    
    try {
      // Get existing rules for context
      const existingRuleTexts = rules.map(r => r.original);
      
      // Run all AI analysis in parallel for better performance
      const [recs, validation, ruleRefinement] = await Promise.all([
        generateRecommendations(rule.trim(), existingRuleTexts),
        validateRules([...existingRuleTexts, rule.trim()]),
        refineRule(rule.trim())
      ]);
      
      setRecommendations(recs);
      setValidationResult(validation);
      setRefinement(ruleRefinement);
      
      addToast({
        type: 'info',
        message: 'Analysis complete! Check the suggestions below.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      addToast({
        type: 'error',
        message: 'Failed to analyze rule. Please try again.',
        duration: 5000
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rule.trim() && !isLoading) {
      try {
        // Parse the rule using AI
        const parsed = await parseRule(rule);
        
        // Get existing rules for better recommendations
        const existingRuleTexts = rules.map(r => r.original);
        const finalRecommendations = await generateRecommendations(rule, existingRuleTexts);
        
        // Validate the complete rule set including this new rule
        const allRules = [...existingRuleTexts, rule];
        const validation = await validateRules(allRules);
        
        // Determine status based on validation
        let status: 'valid' | 'warning' | 'error' = 'valid';
        if (validation.conflicts && validation.conflicts.length > 0) {
          status = 'error';
        } else if (!validation.valid) {
          status = 'warning';
        }
        
        // Create the new rule
        const newRule = {
          id: generateId(),
          original: rule,
          parsed,
          priority: 1,
          weight: 1,
          status,
          suggestions: finalRecommendations,
        };
        
        addRule(newRule);
        setRule('');
        setShowPreview(false);
        setValidationResult(null);
        setRecommendations([]);
        setRefinement(null);
        
        // Show appropriate toast
        if (status === 'error') {
          addToast({
            type: 'error',
            message: 'Rule added with conflicts detected. Please review.',
            duration: 5000
          });
        } else if (status === 'warning') {
          addToast({
            type: 'warning',
            message: 'Rule added with warnings. Please review.',
            duration: 4000
          });
        } else {
          addToast({
            type: 'success',
            message: 'Rule added successfully!',
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Error adding rule:', error);
        // Fallback: add rule without AI parsing
        const fallbackRule = {
          id: generateId(),
          original: rule,
          parsed: { raw: rule },
          priority: 1,
          weight: 1,
          status: 'warning' as const,
          suggestions: ['AI parsing failed - please review manually'],
        };
        addRule(fallbackRule);
        setRule('');
        setShowPreview(false);
        setValidationResult(null);
        setRecommendations([]);
        setRefinement(null);
        
        addToast({
          type: 'error',
          message: 'Failed to parse rule with AI. Added with manual review needed.',
          duration: 5000
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="text"
            value={rule}
            onChange={handleInputChange}
            placeholder="Type your business rule here... (e.g., 'If order value is over $100, apply 10% discount')"
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleTestAI}
            className="px-3"
            title="Test AI Connection"
          >
            🧪
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGetSuggestions}
            disabled={!rule.trim() || isAnalyzing}
            className="px-4"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
          <Button 
            type="submit" 
            disabled={!rule.trim() || isLoading}
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </>
            )}
          </Button>
        </div>
        
        {rule.trim() && !showPreview && (
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p>💡 <strong>Tip:</strong> Click "Analyze" to get AI suggestions and validation before adding your rule</p>
          </div>
        )}
      </form>

      {/* Real-time validation feedback */}
      {showPreview && rule.trim() && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Rule Preview & Analysis</h3>
          
          {/* Validation Status */}
          {validationResult && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {validationResult.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-medium">
                  {validationResult.valid ? 'Rule looks good!' : 'Potential issues detected'}
                </span>
              </div>
              
              {/* Show conflicts if any */}
              {validationResult.conflicts && validationResult.conflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                  <h4 className="font-medium text-red-800 mb-2">⚠️ Conflicts Detected:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationResult.conflicts.map((conflict: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {conflict}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Show validation suggestions */}
              {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Validation Suggestions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {validationResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Rule Refinement */}
          {refinement && (
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-800">Refined Rule Version:</h4>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white border border-purple-200 rounded-md p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">Improved Version:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{refinement.improvedRule}</p>
                </div>
                
                {refinement.improvements && refinement.improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-purple-800 mb-2">Key Improvements:</p>
                    <ul className="text-sm text-purple-700 space-y-1">
                      {refinement.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {refinement.reasoning && (
                  <div className="bg-purple-25 p-3 rounded-md">
                    <p className="text-sm font-medium text-purple-800 mb-1">Why These Improvements Matter:</p>
                    <p className="text-sm text-purple-700">{refinement.reasoning}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRule(refinement.improvedRule)}
                    className="text-purple-700 border-purple-300 hover:bg-purple-100"
                  >
                    Use Refined Version
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">AI Recommendations:</h4>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Loading state for analysis */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing rule with AI...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple ID generator
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export default RuleInput;