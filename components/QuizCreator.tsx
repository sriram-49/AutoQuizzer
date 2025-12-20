import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Difficulty, Quiz, QuizDraft } from '../types';
import { generateQuizFromContent } from '../services/geminiService';
import { getQuizDraft, saveQuizDraft, clearQuizDraft } from '../services/storageService';
import { DocumentIcon, LightBulbIcon, ExclamationIcon, SpinnerIcon, CheckIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

// Add declarations for global scripts
declare const mammoth: any;
declare const JSZip: any;

// Set up the worker source for pdfjs from a CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

interface QuizCreatorProps {
  onQuizCreated: (quiz: Quiz) => void;
  onCancel: () => void;
  setIsDirty: (isDirty: boolean) => void;
}

type FileProcessingState = 'idle' | 'extracting' | 'ready' | 'error';

const QuizCreator = forwardRef< { getDraftData: () => QuizDraft }, QuizCreatorProps>(
  ({ onQuizCreated, onCancel, setIsDirty }, ref) => {
  const [topic, setTopic] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileProcessingState, setFileProcessingState] = useState<FileProcessingState>('idle');
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [inputType, setInputType] = useState<'topic' | 'file'>('topic');
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  
  const [draft, setDraft] = useState<QuizDraft | null>(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [initialState, setInitialState] = useState<QuizDraft | null>(null);

    const getFormData = useCallback((): QuizDraft => {
        return {
            inputType, topic, customTitle, additionalContext, fileName, fileContent,
            numQuestions, difficulty, timeLimit
        };
    }, [inputType, topic, customTitle, additionalContext, fileName, fileContent, numQuestions, difficulty, timeLimit]);
    
    useEffect(() => {
        const savedDraft = getQuizDraft();
        if (savedDraft) {
            setDraft(savedDraft);
            setShowDraftPrompt(true);
        } else {
            setInitialState(getFormData());
        }
    }, []); // Run only once on mount, getFormData is not needed here
    
    useEffect(() => {
        if (!initialState) return;

        const currentState = getFormData();
        const dirty = JSON.stringify(currentState) !== JSON.stringify(initialState);
        setIsDirty(dirty);

    }, [getFormData, initialState, setIsDirty]);

    useImperativeHandle(ref, () => ({
        getDraftData: () => {
            return getFormData();
        }
    }), [getFormData]);
    
  useEffect(() => {
    if (isLoading) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTimer(0);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isLoading]);
  
  const resetFileInputs = () => {
      setFileContent('');
      setFileName('');
      setError('');
      setFileProcessingState('idle');
      setProcessingMessage('');
  }
  
    const handleRestoreDraft = () => {
        if (draft) {
            setInputType(draft.inputType);
            setTopic(draft.topic);
            setCustomTitle(draft.customTitle);
            setAdditionalContext(draft.additionalContext);
            setFileName(draft.fileName);
            setFileContent(draft.fileContent);
            setNumQuestions(draft.numQuestions);
            setDifficulty(draft.difficulty);
            setTimeLimit(draft.timeLimit);
            setInitialState(draft);
            
            if(draft.inputType === 'file' && draft.fileContent) {
                setFileProcessingState('ready');
                setProcessingMessage('Restored document. Ready to generate quiz!');
            }
        }
        setShowDraftPrompt(false);
    };
  
  const handleDismissDraft = () => {
    clearQuizDraft();
    setInitialState(getFormData());
    setShowDraftPrompt(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    resetFileInputs();

    if (file) {
      setFileName(file.name);
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      setFileProcessingState('extracting');
      setProcessingMessage('Extracting text from file...');
      setError('');

      try {
        const arrayBuffer = await file.arrayBuffer();
        let fullText = '';

        switch (extension) {
            case 'pdf': {
                const typedArray = new Uint8Array(arrayBuffer);
                const loadingTask = pdfjsLib.getDocument(typedArray);
                const pdf = await loadingTask.promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => (item as any).str).join(' ');
                    fullText += pageText + '\n\n';
                }
                break;
            }
            case 'txt': {
                fullText = new TextDecoder().decode(arrayBuffer);
                break;
            }
            case 'docx': {
                const result = await mammoth.extractRawText({ arrayBuffer });
                fullText = result.value;
                break;
            }
            case 'pptx':
            case 'ppsx': {
                const zip = await JSZip.loadAsync(arrayBuffer);
                const slideFiles = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name));
                
                const slideTexts = await Promise.all(slideFiles.map(async (slideFileName) => {
                    const slideXml = await zip.file(slideFileName).async('string');
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(slideXml, 'application/xml');
                    const textNodes = xmlDoc.querySelectorAll('t');
                    let text = '';
                    textNodes.forEach(node => {
                        text += node.textContent + ' ';
                    });
                    return text.trim();
                }));
                fullText = slideTexts.filter(t => t).join('\n\n');
                break;
            }
            default: {
                setError(`Unsupported file type. Please upload a .txt, .pdf, .docx, or .pptx/.ppsx file.`);
                setFileProcessingState('error');
                return;
            }
        }
        
        fullText = fullText.trim();
        setFileContent(fullText);

        setFileProcessingState('ready');
        setProcessingMessage('Document processed. Ready to generate quiz!');

      } catch (processingError) {
        console.error(`Error processing file:`, processingError);
        const errorMessage = processingError instanceof Error ? processingError.message : `Could not process the file. It might be corrupted or in an unsupported format.`;
        setError(errorMessage);
        setFileProcessingState('error');
      }
    }
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    let content: string;
    let quizTopic = topic;

    if (inputType === 'file') {
        content = fileContent; // Use the full file content
        quizTopic = fileName.replace(/\.[^/.]+$/, '');
    } else {
        content = topic;
        if (additionalContext.trim()) {
            content += `\n\n**Additional Context to focus on:**\n${additionalContext.trim()}`;
        }
        quizTopic = topic;
    }

    if (!content.trim()) {
      setError('Please provide a topic or upload a valid file.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const currentDifficulty = inputType === 'file' ? null : difficulty;
      const generatedData = await generateQuizFromContent({ content }, numQuestions, currentDifficulty);

      const newQuiz: Quiz = {
        id: new Date().toISOString(),
        topic: quizTopic,
        title: customTitle.trim() || generatedData.title,
        description: generatedData.description,
        questions: generatedData.questions,
        difficulty: generatedData.difficulty,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timeLimitMinutes: timeLimit,
      };
      clearQuizDraft();
      onQuizCreated(newQuiz);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [topic, fileContent, numQuestions, difficulty, onQuizCreated, inputType, fileName, timeLimit, customTitle, additionalContext]);

  const handleSaveDraft = () => {
    const draftData = getFormData();
    saveQuizDraft(draftData);
    setInitialState(draftData);
    // Optionally, add a toast notification here to confirm saving
  };
  
  const isFormInvalid = isLoading ||
    (inputType === 'topic' && !topic.trim()) ||
    (inputType === 'file' && fileProcessingState !== 'ready');
  
  const isFileProcessing = fileProcessingState === 'extracting';

  return (
    <div className="max-w-2xl mx-auto bg-surface dark:bg-surface p-8 rounded-2xl shadow-xl animate-fade-in border border-border dark:border-border">
      {showDraftPrompt && (
        <div className="mb-6 p-4 bg-primary-light/10 dark:bg-primary/10 border border-primary-light/30 dark:border-primary/30 rounded-lg flex items-center justify-between animate-slide-up">
            <div>
                <h3 className="font-semibold text-primary-light dark:text-primary">Resume your draft?</h3>
                <p className="text-sm text-text-light-muted dark:text-text-muted">You have a previously saved draft.</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={handleDismissDraft} className="px-3 py-1.5 text-xs font-semibold text-text-light-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-surface-light rounded-md transition-all duration-300 transform hover:scale-105">
                    Discard
                </button>
                <button onClick={handleRestoreDraft} className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-light dark:bg-primary hover:bg-primary-light-hover dark:hover:bg-primary-hover rounded-md transition-all duration-300 transform hover:scale-105">
                    Restore
                </button>
            </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary-light via-primary-light to-primary-light-hover dark:from-primary dark:via-primary dark:to-primary-hover bg-clip-text text-transparent animate-fade-in">Create Your Quiz</h1>
      <p className="text-center text-text-light-muted dark:text-text-muted mb-8 animate-slide-up">Let AI craft the perfect quiz from your topic or document.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background dark:bg-background p-1.5 rounded-lg flex space-x-2">
          <button type="button" onClick={() => setInputType('topic')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105 ${inputType === 'topic' ? 'bg-primary-light dark:bg-primary text-white shadow-md shadow-primary-light/20 dark:shadow-primary/20' : 'text-text-light-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-surface-light'}`}>
            <LightBulbIcon className="inline-block mr-2 h-5 w-5"/>
            From Topic
          </button>
          <button type="button" onClick={() => setInputType('file')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105 ${inputType === 'file' ? 'bg-primary-light dark:bg-primary text-white shadow-md shadow-primary-light/20 dark:shadow-primary/20' : 'text-text-light-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-surface-light'}`}>
            <DocumentIcon className="inline-block mr-2 h-5 w-5" />
            From File
          </button>
        </div>

        <div>
            <label htmlFor="customTitle" className="block text-sm font-medium text-text-light-muted dark:text-text-muted mb-1">Quiz Title (Optional)</label>
            <input
              id="customTitle"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter a custom title for your quiz"
              className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary focus:border-transparent transition-all duration-300 text-text dark:text-text-DEFAULT placeholder:text-text-light-muted dark:placeholder:text-text-muted"
            />
        </div>

        {inputType === 'topic' ? (
          <div className="animate-fade-in space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-text-light-muted dark:text-text-muted mb-1">Topic</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'The Renaissance Period'"
                className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary focus:border-transparent transition-all duration-300 text-text dark:text-text-DEFAULT placeholder:text-text-light-muted dark:placeholder:text-text-muted"
              />
            </div>
            <div>
                <label htmlFor="additionalContext" className="block text-sm font-medium text-text-light-muted dark:text-text-muted mb-1">Additional Context (Optional)</label>
                <textarea
                  id="additionalContext"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={3}
                  placeholder="e.g., Focus on operators and regular expressions in Python"
                  className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary focus:border-transparent transition-all duration-300 text-text dark:text-text-DEFAULT placeholder:text-text-light-muted dark:placeholder:text-text-muted"
                />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-3">
            <label htmlFor="file" className="block text-sm font-medium text-text-light-muted dark:text-text-muted mb-1">Upload File</label>
            <label className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border dark:border-border rounded-lg transition-all duration-300 ${isFileProcessing ? 'cursor-wait bg-primary-light/10 dark:bg-primary/10 border-primary-light dark:border-primary' : 'cursor-pointer hover:border-primary-light dark:hover:border-primary hover:bg-primary-light/10 dark:hover:bg-primary/10 transform hover:scale-[1.02]'}`}>
               {isFileProcessing ? (
                   <div className="flex items-center text-primary-light dark:text-primary">
                       <SpinnerIcon className="h-6 w-6 text-primary-light dark:text-primary mr-3 animate-spin"/>
                       <span className="text-sm text-primary-light dark:text-primary font-medium">{processingMessage}</span>
                   </div>
               ) : (
                    <>
                        <DocumentIcon className="h-6 w-6 text-text-light-muted dark:text-text-muted mr-3"/>
                        <span className="text-sm text-text-light-muted dark:text-text-muted font-medium">{fileName || 'Upload .txt, .pdf, .docx, or .pptx/.ppsx'}</span>
                    </>
               )}
              <input id="file" type="file" accept=".txt,.pdf,.docx,.pptx,.ppsx" onChange={handleFileChange} className="hidden" disabled={isFileProcessing} />
            </label>
            {fileProcessingState === 'ready' && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-xs rounded-lg p-2 flex items-center space-x-2">
                <CheckIcon className="h-4 w-4 flex-shrink-0" />
                <p className="font-medium">{processingMessage}</p>
              </div>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${inputType === 'topic' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div>
            <label htmlFor="numQuestions" className="block text-sm font-medium text-text-light-muted dark:text-text-muted mb-1">Number of Questions</label>
            <input
              id="numQuestions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
              min="5"
              max="50"
              step="5"
              className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary focus:border-transparent transition-all duration-300 text-text dark:text-text-DEFAULT"
            />
          </div>
          <div>
            <label htmlFor="timeLimit" className="block text-sm font-medium text-text-light-muted dark:text-text-muted mb-1">Time Limit (Mins)</label>
            <select
              id="timeLimit"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary focus:border-transparent transition-all duration-300 text-text dark:text-text-DEFAULT"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={30}>30</option>
            </select>
          </div>
          {inputType === 'topic' && (
            <div className="animate-fade-in">
              <label htmlFor="difficulty" className="block text-sm font-medium text-text-light-muted dark:text-text-muted mb-1">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary focus:border-transparent transition-all duration-300 text-text dark:text-text-DEFAULT"
              >
                {Object.values(Difficulty).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
            <div className="bg-danger-surface border border-danger/80 text-red-400 text-sm rounded-lg p-3 flex items-start space-x-3 animate-slide-up">
                <ExclamationIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
            </div>
        )}
        
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-text-light-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-surface-light rounded-lg transition-all duration-300 transform hover:scale-105">Cancel</button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-semibold text-primary-light dark:text-primary hover:bg-primary-light/10 dark:hover:bg-primary/10 rounded-lg transition-all duration-300 border border-primary-light/50 dark:border-primary/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isFormInvalid}
            className="w-48 flex justify-center items-center bg-primary-light dark:bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-light-hover dark:hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background focus:ring-primary-light dark:focus:ring-primary disabled:bg-surface-light dark:disabled:bg-surface-light disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-primary-light/40 dark:hover:shadow-primary/40 transform hover:-translate-y-0.5"
          >
            {isLoading ? <LoadingSpinner text={`Generating... ${timer}s`} /> : 'Generate Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
});

export default QuizCreator;
