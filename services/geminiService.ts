import { Difficulty, Quiz } from '../types';

const API_URL = '/api';

type GeneratedQuizData = Pick<Quiz, 'title' | 'description' | 'questions' | 'difficulty'>;

interface GenerationOptions {
    content: string;
}

export const generateQuizFromContent = async (
  options: GenerationOptions,
  numQuestions: number,
  difficulty: Difficulty | null
): Promise<GeneratedQuizData> => {
  try {
    const response = await fetch(`${API_URL}/gemini/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: options.content,
        numQuestions,
        difficulty,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate quiz');
    }

    const data = await response.json();
    const quizData = data.quizData;

    // Validation
    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions) || 
        quizData.questions.length === 0 || !quizData.difficulty || 
        !Object.values(Difficulty).includes(quizData.difficulty)) {
        console.error("Invalid quiz data structure received from API:", quizData);
        throw new Error("The AI model returned a quiz with an invalid format. Please try again.");
    }

    if (quizData.questions.some(q => !q.questionText || !q.options || 
        q.options.length !== 4 || q.correctAnswerIndex === undefined || 
        q.correctAnswerIndex < 0 || q.correctAnswerIndex >= 4)) {
        console.error("Invalid question structure in quiz data:", quizData);
        throw new Error("The AI model returned one or more malformed questions. Please try again.");
    }

    return quizData;

  } catch (error) {
    console.error("Error generating quiz:", error);
    
    if (error instanceof Error) {
      // Re-throw specific error messages
      if (error.message.includes("invalid format") || 
          error.message.includes("malformed questions") ||
          error.message.includes("safety policies") ||
          error.message.includes("too long") ||
          error.message.includes("temporarily unavailable") ||
          error.message.includes("not configured")) {
        throw error;
      }
    }

    throw new Error('An unexpected error occurred while generating the quiz. Please check your connection and try again.');
  }
};