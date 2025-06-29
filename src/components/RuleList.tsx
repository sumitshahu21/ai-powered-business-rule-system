'use client';

import React from 'react';
import { useRules } from '../hooks/useRules';
import RuleCard from './RuleCard';
import { FileText } from 'lucide-react';

const RuleList: React.FC = () => {
  const { rules } = useRules();

  if (rules.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No rules yet</h3>
        <p className="text-gray-600">Create your first business rule using the form above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map(rule => (
        <RuleCard key={rule.id} rule={rule} />
      ))}
    </div>
  );
};

export default RuleList;