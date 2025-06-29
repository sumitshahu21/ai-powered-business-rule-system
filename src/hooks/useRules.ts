import { useContext } from 'react';
import { RulesContext } from '../store/rules-context';

export const useRules = () => {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
};

export default useRules;