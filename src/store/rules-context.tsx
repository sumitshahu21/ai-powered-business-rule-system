'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Rule {
  id: string;
  original: string;
  parsed: object;
  priority: number;
  weight: number;
  status: 'valid' | 'error' | 'warning';
  suggestions: string[];
}

interface RulesContextType {
  rules: Rule[];
  addRule: (rule: Rule) => void;
  updateRule: (id: string, updatedRule: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
}

export const RulesContext = createContext<RulesContextType | undefined>(undefined);

export const RulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<Rule[]>([]);

  const addRule = (rule: Rule) => {
    setRules((prevRules) => [...prevRules, rule]);
  };

  const updateRule = (id: string, updatedRule: Partial<Rule>) => {
    setRules((prevRules) =>
      prevRules.map((rule) => (rule.id === id ? { ...rule, ...updatedRule } : rule))
    );
  };

  const deleteRule = (id: string) => {
    setRules((prevRules) => prevRules.filter((rule) => rule.id !== id));
  };

  return (
    <RulesContext.Provider value={{ rules, addRule, updateRule, deleteRule }}>
      {children}
    </RulesContext.Provider>
  );
};

export const useRules = () => {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
};