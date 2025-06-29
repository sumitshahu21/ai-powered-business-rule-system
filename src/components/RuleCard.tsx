'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Rule } from '../store/rules-context';
import { useRules } from '../hooks/useRules';
import { useAI } from '../hooks/useAI';
import { useToast } from '../hooks/useToast';
import PrioritySelector from './PrioritySelector';
import { 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface RuleCardProps {
  rule: Rule;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule }) => {
  const { rules, updateRule, deleteRule } = useRules();
  const { parseRule, generateRecommendations, validateRules, isLoading } = useAI();
  const { addToast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(rule.original);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Validated';
      case 'warning':
        return 'Needs Review';
      case 'error':
        return 'Has Conflicts';
      default:
        return 'Unknown';
    }
  };

  const handlePriorityChange = (newPriority: number) => {
    updateRule(rule.id, { priority: newPriority });
  };

  const handleWeightChange = (newWeight: number) => {
    updateRule(rule.id, { weight: newWeight });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this rule?')) {
      deleteRule(rule.id);
    }
  };

  const handleEditStart = () => {
    setEditText(rule.original);
    setEditError(null);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditText(rule.original);
    setEditError(null);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!editText.trim()) {
      setEditError('Rule text cannot be empty');
      return;
    }

    if (editText.trim() === rule.original) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      // Re-parse the edited rule using AI
      const parsed = await parseRule(editText.trim());
      
      // Get recommendations for the updated rule
      const otherRules = rules.filter(r => r.id !== rule.id).map(r => r.original);
      const recommendations = await generateRecommendations(editText.trim(), otherRules);
      
      // Validate the complete rule set with the updated rule
      const allRulesUpdated = [...otherRules, editText.trim()];
      const validation = await validateRules(allRulesUpdated);
      
      // Determine status based on validation
      let status: 'valid' | 'warning' | 'error' = 'valid';
      if (validation.conflicts && validation.conflicts.length > 0) {
        status = 'error';
      } else if (!validation.valid) {
        status = 'warning';
      }
      
      // Update the rule with new text, parsed structure, and validation results
      updateRule(rule.id, {
        original: editText.trim(),
        parsed: parsed,
        status,
        suggestions: recommendations
      });

      setIsEditing(false);
      
      // Show appropriate toast based on validation results
      if (status === 'error') {
        addToast({
          type: 'error',
          message: 'Rule updated but conflicts detected. Please review.',
          duration: 5000
        });
      } else if (status === 'warning') {
        addToast({
          type: 'warning',
          message: 'Rule updated with warnings. Please review.',
          duration: 4000
        });
      } else {
        addToast({
          type: 'success',
          message: 'Rule updated successfully!',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to parse edited rule:', error);
      const errorMessage = 'Failed to parse the edited rule. Please check your syntax and try again.';
      setEditError(errorMessage);
      addToast({
        type: 'error',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      // Get all rule texts
      const allRuleTexts = rules.map(r => r.original);
      
      // Generate fresh recommendations
      const otherRules = rules.filter(r => r.id !== rule.id).map(r => r.original);
      const recommendations = await generateRecommendations(rule.original, otherRules);
      
      // Validate the complete rule set
      const validation = await validateRules(allRuleTexts);
      
      // Determine status based on validation
      let status: 'valid' | 'warning' | 'error' = 'valid';
      if (validation.conflicts && validation.conflicts.length > 0) {
        status = 'error';
      } else if (!validation.valid) {
        status = 'warning';
      }
      
      // Update the rule with fresh validation results
      updateRule(rule.id, {
        status,
        suggestions: recommendations
      });
      
      addToast({
        type: 'info',
        message: 'Rule revalidated successfully!',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to revalidate rule:', error);
      addToast({
        type: 'error',
        message: 'Failed to revalidate rule.',
        duration: 5000
      });
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <Card className={`p-6 transition-all duration-200 hover:shadow-md ${getStatusColor(rule.status)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(rule.status)}
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rule #{rule.id}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(rule.status)}`}>
              {getStatusText(rule.status)}
            </span>
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label htmlFor={`edit-rule-${rule.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Edit Rule
                </label>
                <textarea
                  id={`edit-rule-${rule.id}`}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Enter your business rule in natural language..."
                  disabled={isUpdating}
                />
              </div>
              
              {editError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{editError}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleEditSave}
                  disabled={isUpdating || !editText.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleEditCancel}
                  disabled={isUpdating}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {rule.original}
            </h3>
          )}
          
          {!isEditing && (
            <div className="flex items-center gap-4 mb-3">
              <PrioritySelector
                priority={rule.priority}
                onChange={handlePriorityChange}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Weight:</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={rule.weight}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm font-medium">{rule.weight}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevalidate}
                disabled={isUpdating || isRevalidating}
                title="Revalidate rule with AI"
              >
                {isRevalidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditStart}
                disabled={isUpdating}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isUpdating}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {showDetails && !isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Parsed Structure:</h4>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {JSON.stringify(rule.parsed, null, 2)}
              </pre>
            </div>
            
            {rule.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">AI Suggestions:</h4>
                <ul className="space-y-1">
                  {rule.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default RuleCard;