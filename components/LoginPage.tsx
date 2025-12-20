import React, { useState } from 'react';
import { AutoQuizzerLogo, PersonIcon, LockIcon } from './Icons';

interface LoginPageProps {
  onLogin: (email: string) => Promise<boolean>;
  onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Note: Password is for UI simulation only
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    const success = await onLogin(email);
    if (!success) {
      setError('Invalid email or password.');
    } else {
      setError('');
    }
  };

  return (
    <div 
      className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 via-secondary-light/10 to-primary-light/30 dark:from-primary/20 dark:via-secondary/10 dark:to-primary/30 animate-gradient"></div>
      
      {/* Interactive Mouse Cursor Glow */}
      <div 
        className="absolute w-96 h-96 rounded-full bg-primary-light/30 dark:bg-primary/30 blur-3xl pointer-events-none transition-all duration-500 ease-out"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
          opacity: mousePosition.x === 0 ? 0 : 0.6,
        }}
      ></div>
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-light dark:bg-primary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob transition-transform duration-700 hover:scale-110"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-light dark:bg-secondary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000 transition-transform duration-700 hover:scale-110"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary-light/80 dark:bg-primary/80 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000 transition-transform duration-700 hover:scale-110"></div>
      </div>
      <div className="relative z-10 w-full max-w-md animate-fade-in">
      {error && (
        <div className="max-w-md w-full bg-danger-light-surface dark:bg-danger-surface border border-danger rounded-md p-3 mb-6 text-center animate-scale-in">
            <p className="text-sm font-medium text-danger dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="max-w-md w-full space-y-8 bg-surface dark:bg-surface p-10 rounded-2xl shadow-2xl border border-border dark:border-border animate-slide-up">
        <div className="animate-scale-in">
          <AutoQuizzerLogo className="mx-auto h-12 w-auto text-primary-light dark:text-primary" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text dark:text-text-DEFAULT">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-sm text-text-light-muted dark:text-text-muted">
            Log in to access your dashboard.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <PersonIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 bg-white dark:bg-gray-800 py-3 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light dark:focus:ring-primary sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 bg-white dark:bg-gray-800 py-3 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light dark:focus:ring-primary sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-light dark:bg-primary hover:bg-primary-light-hover dark:hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background focus:ring-primary-light dark:focus:ring-primary transition-all duration-300 transform hover:scale-[1.02]"
            >
              Log In
            </button>
          </div>
        </form>
         <p className="mt-10 text-center text-sm text-text-light-muted dark:text-text-muted">
              Don't have an account?{' '}
              <button onClick={onNavigateToRegister} className="font-semibold leading-6 text-primary-light dark:text-primary hover:text-primary-light-hover dark:hover:text-primary-hover hover:underline transition-colors duration-300">
                Sign up
              </button>
            </p>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;