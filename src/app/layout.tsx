import React from 'react';
import './globals.css';
import { RulesProvider } from '../store/rules-context';
import { ToastProvider } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export const metadata = {
  title: 'Business Rules Manager',
  description: 'Modern web application for creating and managing business rules using natural language',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <RulesProvider>
            {children}
            <ToastContainer />
          </RulesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}