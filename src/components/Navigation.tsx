'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Settings, Brain, FileText } from 'lucide-react';
import { useRules } from '../hooks/useRules';

const Navigation: React.FC = () => {
    const { rules } = useRules();

    const exportAllRules = () => {
        if (rules.length === 0) {
            alert('No rules to export');
            return;
        }

        const dataStr = JSON.stringify(rules, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `all-business-rules-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <Brain className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">Business Rules Manager</span>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/rules" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            All Rules
                        </Link>
                        <Link href="/analytics" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Analytics
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={exportAllRules}>
                            <FileText className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;