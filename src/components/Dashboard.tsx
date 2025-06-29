'use client';

import React from 'react';
import RuleInput from './RuleInput';
import RuleList from './RuleList';
import Navigation from './Navigation';

const Dashboard: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navigation />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Business Rules Dashboard</h1>
                    <p className="text-gray-600 mb-8">Create, manage, and modify business rules using natural language</p>
                    
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Add New Rule</h2>
                        <RuleInput />
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Your Rules</h2>
                        <RuleList />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;