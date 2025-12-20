import React from 'react';
import { Quiz, UserAnswer } from '../types';
import { CheckIcon, XIcon, RefreshIcon } from './Icons';

interface QuizResultsProps {
  quiz: Quiz;
  userAnswers: UserAnswer[];
  score: number;
  onRestart: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quiz, userAnswers, score, onRestart }) => {
  const scoreColorClass = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="max-w-4xl mx-auto bg-surface dark:bg-surface p-8 rounded-2xl shadow-xl animate-fade-in border border-border dark:border-border">
      <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-primary-light via-primary-light to-primary-light-hover dark:from-primary dark:via-primary dark:to-primary-hover bg-clip-text text-transparent animate-fade-in">Quiz Results</h2>
      
      <div className="my-6 flex justify-center animate-scale-in">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center bg-gradient-to-br from-background dark:from-background to-surface dark:to-surface shadow-inner`}>
            <div className={`w-40 h-40 rounded-full flex items-center justify-center bg-surface dark:bg-surface shadow-md`}>
                <p className="text-6xl font-bold" style={{...({} as React.CSSProperties), textShadow: '2px 2px 8px rgba(0,0,0,0.3)'}}>
                    <span className={scoreColorClass}>{score.toFixed(0)}</span>
                    <span className="text-4xl text-text-light-muted dark:text-text-muted font-medium">%</span>
                </p>
            </div>
        </div>
      </div>

      <p className="text-center text-text-light-muted dark:text-text-muted mb-8 animate-slide-up">You answered {userAnswers.filter(a => a.selectedOption !== null && quiz.questions[a.questionIndex].correctAnswerIndex === a.selectedOption).length} out of {quiz.questions.length} questions correctly.</p>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const userAnswer = userAnswers[index]?.selectedOption;
          const isCorrect = userAnswer === question.correctAnswerIndex;

          return (
            <div key={index} className={`p-4 rounded-lg border-l-4 transition-all animate-slide-up ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`} style={{animationDelay: `${index * 0.05}s`}}>
              <p className="font-semibold text-text dark:text-text-DEFAULT mb-3">{index + 1}. {question.questionText}</p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isUserAnswer = userAnswer === optionIndex;
                  const isCorrectAnswer = question.correctAnswerIndex === optionIndex;
                  
                  let itemClass = "flex items-start p-2 rounded text-sm font-medium ";
                  if (isCorrectAnswer) {
                     itemClass += "text-green-300";
                  } else if (isUserAnswer) {
                     itemClass += "text-red-300 line-through opacity-70";
                  } else {
                    itemClass += "text-text-light-muted dark:text-text-muted";
                  }

                  return (
                    <div key={optionIndex} className={itemClass}>
                        {isCorrectAnswer ? <CheckIcon className="h-5 w-5 mr-2 flex-shrink-0 text-green-400" /> : 
                         (isUserAnswer ? <XIcon className="h-5 w-5 mr-2 flex-shrink-0 text-red-400" /> : <div className="w-5 h-5 mr-2 flex-shrink-0" />)}
                      <span className="flex-grow">{option}</span>
                       {isCorrectAnswer && isUserAnswer === null && <span className='text-xs font-bold text-yellow-500 ml-2'>(unanswered)</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={onRestart}
          className="bg-primary-light dark:bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-light-hover dark:hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background focus:ring-primary-light dark:focus:ring-primary transition-all duration-300 shadow-lg hover:shadow-primary-light/40 dark:hover:shadow-primary/40 transform hover:-translate-y-0.5 hover:scale-105 flex items-center mx-auto"
        >
          <RefreshIcon className="h-5 w-5 mr-2"/>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResults;