import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => (
  <div className="flex items-center space-x-2">
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    <span>{text}</span>
  </div>
);