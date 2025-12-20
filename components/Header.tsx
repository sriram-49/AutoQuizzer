import React from 'react';
import { AppState } from '../types';
import { AutoQuizzerLogo } from './Icons';
import { SunIcon, MoonIcon } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
    isLoggedIn: boolean;
    onLogout: () => void;
    onNavigate: (state: AppState) => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-surface dark:bg-surface/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border dark:border-border/50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer group transition-transform duration-300 hover:scale-105" 
          onClick={() => isLoggedIn && onNavigate(AppState.DASHBOARD)}
        >
          <AutoQuizzerLogo className="h-8 w-auto text-primary dark:text-primary group-hover:text-primary-hover transition-colors duration-300" />
          <h1 className="text-xl font-bold text-text dark:text-text-DEFAULT transition-colors duration-300">
            AutoQuizzer
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-surface-light dark:bg-surface-light hover:bg-border dark:hover:bg-border transition-all duration-300 group"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-text-muted dark:text-text-muted group-hover:text-yellow-400 group-hover:rotate-90 transition-all duration-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-text-light-muted group-hover:text-primary-light group-hover:-rotate-12 transition-all duration-300" />
            )}
          </button>
          
          {isLoggedIn && (
            <>
              <button 
                onClick={() => onNavigate(AppState.DASHBOARD)}
                className="px-4 py-2 text-sm font-medium text-text-light-muted dark:text-text-muted hover:bg-surface-hover dark:hover:bg-surface-light rounded-md transition-all duration-300"
              >
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate(AppState.CREATING)}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-light dark:bg-primary hover:bg-primary-light-hover dark:hover:bg-primary-hover rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Create Quiz
              </button>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-text-light-muted dark:text-text-muted hover:bg-surface-hover dark:hover:bg-surface-light rounded-md transition-all duration-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};