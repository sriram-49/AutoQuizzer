// FIX: Replaced placeholder content with the QuizCard component implementation.
import React, { useState } from 'react';
import { Quiz } from '../types';
import { ChartPieIcon, DownloadIcon, PlayIcon, TrashIcon, ExclamationIcon } from './Icons';
import Modal from './Modal';

interface QuizCardProps {
    quiz: Quiz;
    onTakeQuiz: (quizId: string) => void;
    onDeleteQuiz: (quizId: string) => void;
    onDownloadPdf: (quiz: Quiz) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onTakeQuiz, onDeleteQuiz, onDownloadPdf }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const difficultyStyles = {
        Easy: { bg: 'bg-easy', text: 'text-easy-text' },
        Medium: { bg: 'bg-medium', text: 'text-medium-text' },
        Hard: { bg: 'bg-hard', text: 'text-hard-text' },
    }[quiz.difficulty];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };
    
    const handleDeleteConfirm = () => {
        onDeleteQuiz(quiz.id);
        setIsDeleteModalOpen(false);
    }

    return (
        <>
            <div className="relative group">
                {quiz.description && (
                    <div className="absolute bottom-full mb-2 w-full px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <div className="bg-slate-950 dark:bg-slate-950 text-white text-center text-xs rounded-lg py-2 px-3 shadow-lg border border-border dark:border-border">
                            {quiz.description}
                        </div>
                    </div>
                )}
                <div className="bg-surface dark:bg-surface border border-border dark:border-border rounded-xl shadow-lg transition-all duration-300 hover:shadow-primary-light/20 dark:hover:shadow-primary/20 hover:-translate-y-1 hover:scale-[1.02] flex flex-col h-full">
                    <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-text dark:text-text-DEFAULT pr-2">{quiz.title}</h3>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${difficultyStyles.bg} ${difficultyStyles.text}`}>
                                {quiz.difficulty.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-sm text-text-light-muted dark:text-text-muted mb-4">Topic: {quiz.topic}</p>
                        
                        <div className="border-t border-border dark:border-border pt-4 mt-4 space-y-3 text-sm text-text-light-muted dark:text-text-muted">
                            <div className="flex items-center">
                                <span className="w-28 font-semibold">QUESTIONS</span>
                                <span>{quiz.questions.length}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-28 font-semibold">CREATED</span>
                                <span>{quiz.createdAt}</span>
                            </div>
                           {typeof quiz.lastScore === 'number' && (
                                <div className="flex items-center">
                                     <span className="w-28 font-semibold flex items-center">
                                         <ChartPieIcon className="h-4 w-4 mr-1.5"/>
                                         LAST SCORE
                                    </span>
                                    <span className={`font-bold text-base ${getScoreColor(quiz.lastScore)}`}>
                                        {quiz.lastScore.toFixed(0)}%
                                    </span>
                                </div>
                           )}
                        </div>
                    </div>
                    <div className="border-t border-border dark:border-border p-4 flex justify-end space-x-2 bg-background/30 dark:bg-background/30 rounded-b-xl">
                        <button
                            onClick={() => onDownloadPdf(quiz)}
                            className="p-2 text-text-light-muted dark:text-text-muted hover:text-primary-light dark:hover:text-primary hover:bg-primary-light/10 dark:hover:bg-primary/10 rounded-full transition-all duration-300 transform hover:scale-110"
                            title="Download PDF"
                        >
                            <DownloadIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-2 text-text-light-muted dark:text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-all duration-300 transform hover:scale-110"
                            title="Delete Quiz"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => onTakeQuiz(quiz.id)}
                            className="flex items-center bg-primary-light dark:bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-light-hover dark:hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background focus:ring-primary-light dark:focus:ring-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-primary-light/40 dark:hover:shadow-primary/40 transform hover:scale-105 text-sm"
                        >
                            <PlayIcon className="h-5 w-5 mr-2"/>
                            Take Quiz
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div>
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger/10">
                            <ExclamationIcon className="h-6 w-6 text-danger" aria-hidden="true" />
                        </div>
                        <p className="text-text-light-muted dark:text-text-muted">Are you sure you want to delete the quiz "{quiz.title}"? This action cannot be undone.</p>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-text-light-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-surface-light rounded-lg transition-all duration-300 transform hover:scale-105">
                            Cancel
                        </button>
                         <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger-hover rounded-lg transition-all duration-300 transform hover:scale-105">
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default QuizCard;