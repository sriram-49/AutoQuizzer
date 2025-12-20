import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import QuizCard from './QuizCard';
import { getQuizDraft } from '../services/storageService';
import { EditIcon } from './Icons';

interface DashboardProps {
    quizzes: Quiz[];
    onCreateQuiz: () => void;
    onTakeQuiz: (quizId: string) => void;
    onDeleteQuiz: (quizId: string) => void;
    onDownloadPdf: (quiz: Quiz) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ quizzes, onCreateQuiz, onTakeQuiz, onDeleteQuiz, onDownloadPdf }) => {
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        setHasDraft(!!getQuizDraft());
    }, []);

    return (
        <div className="animate-fade-in space-y-12">
            <section className="text-center py-10 animate-slide-up">
                <h1 className="text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-blue-400 dark:to-violet-400 animate-scale-in">
                    Made for the instructors to level up their students with Quizzes
                </h1>
                <p className="mt-4 text-lg text-text-light-muted dark:text-text-muted max-w-2xl mx-auto">
                    Create, manage, and take quizzes with our intelligent platform
                </p>
            </section>
            
            <section className="animate-slide-in-right">
                {hasDraft && (
                    <div className="mb-8 p-4 bg-primary-light/10 dark:bg-primary/10 border border-primary-light/30 dark:border-primary/30 rounded-lg flex items-center justify-between animate-fade-in shadow-md hover:shadow-lg transition-all duration-300">
                        <div>
                            <h3 className="font-semibold text-primary-light dark:text-primary">You have a saved draft.</h3>
                            <p className="text-sm text-primary-light-hover dark:text-blue-300">Continue where you left off creating your quiz.</p>
                        </div>
                        <button 
                            onClick={onCreateQuiz}
                            className="flex items-center bg-primary-light dark:bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-light-hover dark:hover:bg-primary-hover transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                        >
                            <EditIcon className="h-5 w-5 mr-2"/>
                            Resume Editing
                        </button>
                    </div>
                )}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text dark:text-text-DEFAULT">My Quizzes</h2>
                    <span className="text-sm font-medium text-text-light-muted dark:text-text-muted bg-surface dark:bg-surface px-3 py-1 rounded-full">{quizzes.length} quizzes</span>
                </div>
                {quizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz, index) => (
                            <div key={quiz.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <QuizCard 
                                    quiz={quiz}
                                    onTakeQuiz={onTakeQuiz}
                                    onDeleteQuiz={onDeleteQuiz}
                                    onDownloadPdf={onDownloadPdf}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-surface dark:bg-surface/80 border-2 border-dashed border-border dark:border-border rounded-lg hover:border-primary-light dark:hover:border-primary transition-all duration-300 animate-bounce-subtle">
                        <h3 className="text-xl font-semibold text-text dark:text-text-DEFAULT">No quizzes yet!</h3>
                        <p className="text-text-light-muted dark:text-text-muted mt-2">Ready to create your first quiz?</p>
                        <button 
                            onClick={onCreateQuiz}
                            className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-primary-light dark:bg-primary hover:bg-primary-light-hover dark:hover:bg-primary-hover rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                        >
                            Create a Quiz
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;