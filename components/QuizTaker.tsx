import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Quiz, UserAnswer } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, ExclamationIcon } from './Icons';

interface QuizTakerProps {
  quiz: Quiz;
  onQuizSubmit: (answers: UserAnswer[]) => void;
  setIsDirty: (isDirty: boolean) => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onQuizSubmit, setIsDirty }) => {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-surface dark:bg-surface p-8 rounded-2xl shadow-xl animate-fade-in border border-border dark:border-border text-center">
        <div className="flex justify-center items-center mb-4">
          <ExclamationIcon className="h-12 w-12 text-danger animate-bounce-subtle" />
        </div>
        <h2 className="text-2xl font-bold text-danger mb-4">Quiz Error</h2>
        <p className="text-text-light-muted dark:text-text-muted">
          This quiz could not be loaded because it contains no questions. Please go back and try a different quiz.
        </p>
      </div>
    );
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>(() => 
    quiz.questions.map((_, index) => ({ questionIndex: index, selectedOption: null }))
  );
  const [timeLeft, setTimeLeft] = useState(() => quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null);
  
  const submitRef = useRef(onQuizSubmit);
  const answersRef = useRef(answers);
  
  useEffect(() => {
    const hasProgress = answers.some(a => a.selectedOption !== null);
    setIsDirty(hasProgress);
  }, [answers, setIsDirty]);

  useEffect(() => {
    submitRef.current = onQuizSubmit;
  }, [onQuizSubmit]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev > 1) {
          return prev - 1;
        }
        clearInterval(timerId);
        submitRef.current(answersRef.current); // Submit when time runs out
        return 0;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []); // Run effect only once on mount to start the timer


  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = useMemo(() => ((currentQuestionIndex + 1) / quiz.questions.length) * 100, [currentQuestionIndex, quiz.questions.length]);

  const formatTime = (seconds: number | null): string => {
      if (seconds === null) return '';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { ...newAnswers[currentQuestionIndex], selectedOption: optionIndex };
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsDirty(false); // No longer dirty after submission
    onQuizSubmit(answers);
  };

  return (
    <div className="relative max-w-3xl mx-auto bg-surface dark:bg-surface p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in border border-border dark:border-border">
      {quiz.timeLimitMinutes && (
        <div className="absolute top-6 right-6 flex items-center bg-surface-light dark:bg-surface-light px-3 py-1.5 rounded-full text-sm font-semibold z-10 text-primary-light dark:text-primary animate-slide-in-right">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>{formatTime(timeLeft)}</span>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 bg-gradient-to-r from-primary-light via-primary-light to-primary-light-hover dark:from-primary dark:via-primary dark:to-primary-hover bg-clip-text text-transparent animate-fade-in">{quiz.title}</h2>

      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-primary-light dark:text-primary">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <span className="text-sm font-medium text-primary-light dark:text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-surface-light dark:bg-surface-light rounded-full h-2.5">
          <div className="bg-primary-light dark:bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="bg-background dark:bg-background p-6 rounded-lg mb-6 animate-slide-up" key={currentQuestionIndex}>
        <p className="text-lg font-semibold mb-5 text-text dark:text-text-DEFAULT">{currentQuestion.questionText}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestionIndex].selectedOption === index;
            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 border rounded-lg transition-all duration-200 flex items-center transform hover:scale-[1.02] hover:shadow-md
                  ${isSelected ? 'bg-primary-light/20 dark:bg-primary/20 border-primary-light dark:border-primary ring-2 ring-primary-light dark:ring-primary shadow-lg' : 'bg-surface dark:bg-surface border-border dark:border-border hover:bg-surface-light dark:hover:bg-surface-light hover:border-primary-light/50 dark:hover:border-primary/50'}`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full mr-4 flex items-center justify-center border-2 font-bold
                  ${isSelected ? 'bg-primary-light dark:bg-primary border-primary-light dark:border-primary text-white' : 'border-border dark:border-border text-text-light-muted dark:text-text-muted'}`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-grow font-medium text-text dark:text-text-DEFAULT">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-surface-light dark:bg-surface-light text-text dark:text-text-DEFAULT rounded-lg hover:bg-border dark:hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center font-semibold transform hover:scale-105"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Previous
        </button>
        
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-600/40 transform hover:-translate-y-0.5 hover:scale-105"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            className="px-6 py-2 bg-primary-light dark:bg-primary text-white font-semibold rounded-lg hover:bg-primary-light-hover dark:hover:bg-primary-hover transition-all duration-300 flex items-center shadow-md hover:shadow-primary-light/40 dark:hover:shadow-primary/40 transform hover:-translate-y-0.5 hover:scale-105"
          >
            Next
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
