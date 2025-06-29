'use client';

import React from 'react';
import { Button } from './ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface PrioritySelectorProps {
  priority: number;
  onChange: (newPriority: number) => void;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({ priority, onChange }) => {
  const priorities = [
    { value: 1, label: 'Low', color: 'text-green-600' },
    { value: 2, label: 'Medium', color: 'text-yellow-600' },
    { value: 3, label: 'High', color: 'text-red-600' },
    { value: 4, label: 'Critical', color: 'text-red-800' }
  ];

  const currentPriority = priorities.find(p => p.value === priority) || priorities[0];

  const handleIncrease = () => {
    const newPriority = Math.min(priority + 1, 4);
    onChange(newPriority);
  };

  const handleDecrease = () => {
    const newPriority = Math.max(priority - 1, 1);
    onChange(newPriority);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Priority:</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDecrease}
          disabled={priority <= 1}
          className="h-6 w-6 p-0"
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
        <span className={`text-sm font-medium min-w-[60px] text-center ${currentPriority.color}`}>
          {currentPriority.label}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleIncrease}
          disabled={priority >= 4}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default PrioritySelector;