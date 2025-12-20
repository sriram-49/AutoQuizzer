// FIX: Replaced placeholder content with the main application component implementation.
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Quiz, User, UserAnswer, QuizDraft } from './types';
import { getCurrentUser, loginUser, logoutUser, registerUser } from './services/authService';
import { getQuizzes, saveQuiz, deleteQuiz, updateQuizScore, saveQuizDraft, clearQuizDraft } from './services/storageService';
import { downloadQuizAsPdf } from './services/pdfService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import QuizCreator from './components/QuizCreator';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';
import Modal from './components/Modal';
// FIX: Removed unused 'HomeIcon' import as it is not exported from './components/Icons'.
import { DownloadIcon, PlayIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<{ answers: UserAnswer[], score: number } | null>(null);
  const [newQuizCreated, setNewQuizCreated] = useState<Quiz | null>(null);
  
  // State for unsaved changes confirmation
  const [isDirty, setIsDirty] = useState(false);
  const [showNavigationConfirm, setShowNavigationConfirm] = useState(false);
  const [nextState, setNextState] = useState<AppState | null>(null);
  const creatorRef = useRef<{ getDraftData: () => QuizDraft }>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const userQuizzes = await getQuizzes(user.email);
        setQuizzes(userQuizzes);
        setAppState(AppState.DASHBOARD);
      }
    };
    loadUserData();
  }, []);

  const handleLogin = async (email: string): Promise<boolean> => {
    const user = await loginUser(email);
    if (user) {
      setCurrentUser(user);
      const userQuizzes = await getQuizzes(user.email);
      setQuizzes(userQuizzes);
      setAppState(AppState.DASHBOARD);
      return true;
    }
    return false;
  };
  
  const handleRegister = async (email: string): Promise<boolean> => {
    const user = await registerUser(email);
    if (user) {
      setCurrentUser(user);
      setQuizzes([]); // New user has no quizzes
      setAppState(AppState.DASHBOARD);
      return true;
    }
    return false; // User already exists
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setQuizzes([]);
    setActiveQuiz(null);
    setQuizResults(null);
    setNewQuizCreated(null);
    setAppState(AppState.LOGIN);
  };
  
  const handleQuizCreated = async (quiz: Quiz) => {
    if (currentUser) {
      const success = await saveQuiz(currentUser.email, quiz);
      if (success) {
        const updatedQuizzes = await getQuizzes(currentUser.email);
        setQuizzes(updatedQuizzes);
        setNewQuizCreated(quiz); // Set the new quiz to trigger the modal
      }
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (currentUser) {
      const success = await deleteQuiz(currentUser.email, quizId);
      if (success) {
        const updatedQuizzes = await getQuizzes(currentUser.email);
        setQuizzes(updatedQuizzes);
      }
    }
  };
  
  const handleTakeQuiz = (quizId: string) => {
    const quizToTake = quizzes.find(q => q.id === quizId);
    if (quizToTake) {
      setActiveQuiz(quizToTake);
      setQuizResults(null);
      setNewQuizCreated(null); // Close modal if open
      setAppState(AppState.TAKING_QUIZ);
    }
  };
  
  const handleQuizSubmit = async (answers: UserAnswer[]) => {
    if (activeQuiz && currentUser) {
      const correctAnswers = activeQuiz.questions.reduce((count, question, index) => {
        return count + (question.correctAnswerIndex === answers[index].selectedOption ? 1 : 0);
      }, 0);
      const score = (correctAnswers / activeQuiz.questions.length) * 100;
      
      // Update the quiz with the new score
      await updateQuizScore(currentUser.email, activeQuiz.id, score);
      const updatedQuizzes = await getQuizzes(currentUser.email);
      setQuizzes(updatedQuizzes);

      setQuizResults({ answers, score });
      setAppState(AppState.VIEWING_RESULTS);
    }
  };

  const handleRestart = () => {
    setActiveQuiz(null);
    setQuizResults(null);
    setAppState(AppState.DASHBOARD);
  };

  const closeModalAndNavigate = (state: AppState) => {
    setNewQuizCreated(null);
    navigate(state);
  };

  const navigate = (state: AppState) => {
    // Reset transient states when navigating away
    if (state === AppState.DASHBOARD || state === AppState.CREATING) {
      setActiveQuiz(null);
      setQuizResults(null);
    }
    if(appState === AppState.CREATING || appState === AppState.TAKING_QUIZ) {
      setIsDirty(false);
    }
    setAppState(state);
  };
  
  const handleRequestNavigation = (targetState: AppState) => {
    if (targetState === appState) return;

    if (isDirty && (appState === AppState.CREATING || appState === AppState.TAKING_QUIZ)) {
      setNextState(targetState);
      setShowNavigationConfirm(true);
    } else {
      navigate(targetState);
    }
  };
  
  const handleCloseNavigationModal = () => {
    setShowNavigationConfirm(false);
    setNextState(null);
  };

  const handleConfirmLeave = () => {
    if (nextState) {
        navigate(nextState);
    }
    handleCloseNavigationModal();
  };
  
  const handleConfirmDiscard = () => {
    if(appState === AppState.CREATING) {
        clearQuizDraft();
    }
    handleConfirmLeave();
  };

  const handleConfirmSave = () => {
    if(appState === AppState.CREATING && creatorRef.current) {
        const draftData = creatorRef.current.getDraftData();
        saveQuizDraft(draftData);
    }
    handleConfirmLeave();
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LOGIN:
        return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => navigate(AppState.REGISTER)} />;
      case AppState.REGISTER:
        return <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => navigate(AppState.LOGIN)} />;
      case AppState.DASHBOARD:
        return (
          <Dashboard
            quizzes={quizzes}
            onCreateQuiz={() => navigate(AppState.CREATING)}
            onTakeQuiz={handleTakeQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onDownloadPdf={downloadQuizAsPdf}
          />
        );
      case AppState.CREATING:
        return <QuizCreator ref={creatorRef} onQuizCreated={handleQuizCreated} onCancel={() => handleRequestNavigation(AppState.DASHBOARD)} setIsDirty={setIsDirty} />;
      case AppState.TAKING_QUIZ:
        return activeQuiz ? <QuizTaker quiz={activeQuiz} onQuizSubmit={handleQuizSubmit} setIsDirty={setIsDirty} /> : null;
      case AppState.VIEWING_RESULTS:
        return activeQuiz && quizResults ? (
          <QuizResults quiz={activeQuiz} userAnswers={quizResults.answers} score={quizResults.score} onRestart={handleRestart} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-background dark:bg-background min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Animated Wave Background - Only for Dashboard */}
      {appState === AppState.DASHBOARD && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <svg className="absolute bottom-0 left-0 w-full h-96 opacity-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%">
                  <animate attributeName="stop-color" values="#6b8f71;#9f7aea;#6b8f71" dur="8s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%">
                  <animate attributeName="stop-color" values="#9f7aea;#6b8f71;#9f7aea" dur="8s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <path fill="url(#wave-gradient1)" fillOpacity="0.6" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
              <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
                M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,160L48,144C96,128,192,96,288,101.3C384,107,480,149,576,165.3C672,181,768,171,864,144C960,117,1056,75,1152,69.3C1248,64,1344,96,1392,112L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
            </path>
          </svg>
          
          <svg className="absolute bottom-0 left-0 w-full h-96 opacity-30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%">
                  <animate attributeName="stop-color" values="#3b82f6;#6d28d9;#3b82f6" dur="10s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%">
                  <animate attributeName="stop-color" values="#6d28d9;#3b82f6;#6d28d9" dur="10s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <path fill="url(#wave-gradient2)" fillOpacity="0.7" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,192C672,181,768,139,864,122.7C960,107,1056,117,1152,138.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
              <animate attributeName="d" dur="15s" repeatCount="indefinite" values="
                M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,192C672,181,768,139,864,122.7C960,107,1056,117,1152,138.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,154.7C672,128,768,96,864,101.3C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,192C672,181,768,139,864,122.7C960,107,1056,117,1152,138.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
            </path>
          </svg>
          
          <svg className="absolute bottom-0 left-0 w-full h-96 opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%">
                  <animate attributeName="stop-color" values="#5a7a60;#8b5cf6;#5a7a60" dur="12s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%">
                  <animate attributeName="stop-color" values="#8b5cf6;#5a7a60;#8b5cf6" dur="12s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <path fill="url(#wave-gradient3)" fillOpacity="0.8" d="M0,32L48,58.7C96,85,192,139,288,149.3C384,160,480,128,576,112C672,96,768,96,864,117.3C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
              <animate attributeName="d" dur="20s" repeatCount="indefinite" values="
                M0,32L48,58.7C96,85,192,139,288,149.3C384,160,480,128,576,112C672,96,768,96,864,117.3C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,197.3C672,203,768,181,864,154.7C960,128,1056,96,1152,101.3C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,32L48,58.7C96,85,192,139,288,149.3C384,160,480,128,576,112C672,96,768,96,864,117.3C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
            </path>
          </svg>
        </div>
      )}
      
      <Header isLoggedIn={!!currentUser} onLogout={handleLogout} onNavigate={handleRequestNavigation} />
      <main className={`${(appState === AppState.LOGIN || appState === AppState.REGISTER) ? '' : 'container mx-auto px-4 py-8'} flex-grow relative z-10`}>
        {renderContent()}
      </main>
      <Footer />
       <Modal
          isOpen={!!newQuizCreated}
          onClose={() => closeModalAndNavigate(AppState.DASHBOARD)}
          title="Quiz Generated Successfully!"
       >
           {newQuizCreated && (
                <div>
                    <p className="text-text-muted mb-6">Your quiz "{newQuizCreated.title}" is ready. What would you like to do next?</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleTakeQuiz(newQuizCreated.id)}
                            className="w-full flex items-center justify-center bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-hover transition-all duration-300 shadow-lg hover:shadow-primary/40"
                        >
                            <PlayIcon className="h-5 w-5 mr-2"/>
                            Take Quiz
                        </button>
                         <button
                            onClick={() => {
                                downloadQuizAsPdf(newQuizCreated);
                                closeModalAndNavigate(AppState.DASHBOARD);
                            }}
                            className="w-full flex items-center justify-center bg-surface-light text-text-DEFAULT py-3 px-4 rounded-lg font-semibold hover:bg-border transition-colors"
                        >
                            <DownloadIcon className="h-5 w-5 mr-2"/>
                            Download PDF
                        </button>
                        <button
                            onClick={() => closeModalAndNavigate(AppState.DASHBOARD)}
                            className="w-full flex items-center justify-center text-sm text-text-muted py-2 px-4 rounded-lg hover:bg-surface-light transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
       </Modal>
       
       <Modal
          isOpen={showNavigationConfirm}
          onClose={handleCloseNavigationModal}
          title={appState === AppState.CREATING ? "Unsaved Changes" : "Leave Quiz?"}
       >
          {appState === AppState.CREATING ? (
              <div>
                  <p className="text-text-muted mb-6">You have unsaved changes. Would you like to save them as a draft before exiting?</p>
                  <div className="flex flex-col space-y-3">
                      <button onClick={handleConfirmSave} className="w-full text-center bg-primary text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
                          Save & Exit
                      </button>
                      <button onClick={handleConfirmDiscard} className="w-full text-center bg-danger/20 text-danger py-2.5 px-4 rounded-lg font-semibold hover:bg-danger/30 transition-colors">
                          Discard & Exit
                      </button>
                      <button onClick={handleCloseNavigationModal} className="w-full text-center text-sm text-text-muted py-2 px-4 rounded-lg hover:bg-surface-light transition-colors">
                          Cancel
                      </button>
                  </div>
              </div>
          ) : (
              <div>
                  <p className="text-text-muted mb-6">Are you sure you want to leave? Your current progress will be lost.</p>
                  <div className="flex justify-end space-x-3">
                      <button onClick={handleCloseNavigationModal} className="px-4 py-2 text-sm font-semibold text-text-muted hover:bg-surface-light rounded-lg transition-colors">
                          Stay
                      </button>
                      <button onClick={handleConfirmLeave} className="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger-hover rounded-lg transition-colors">
                          Leave
                      </button>
                  </div>
              </div>
          )}
       </Modal>
    </div>
  );
};

export default App;
