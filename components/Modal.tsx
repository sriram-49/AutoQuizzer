import React, { FC, ReactNode } from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <div
        className="bg-surface dark:bg-surface rounded-2xl shadow-2xl shadow-slate-950 w-full max-w-md border border-border dark:border-border transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-border dark:border-border">
          <h2 className="text-lg font-bold text-text dark:text-text-DEFAULT">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-light-muted dark:text-text-muted hover:text-text dark:hover:text-text-DEFAULT transition-colors rounded-full p-1 hover:bg-surface-light dark:hover:bg-surface-light"
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
