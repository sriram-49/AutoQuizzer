import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent mt-auto py-6">
      <div className="container mx-auto px-4 text-center text-sm text-text-muted">
        <p>&copy; {new Date().getFullYear()} AutoQuizzer. All rights reserved.</p>
      </div>
    </footer>
  );
};