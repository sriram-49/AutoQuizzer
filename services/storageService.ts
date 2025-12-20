import { Quiz, QuizDraft } from '../types';

const API_URL = '/api';

// --- Quiz Storage (now via API) ---

export const getQuizzes = async (userEmail: string): Promise<Quiz[]> => {
    try {
        const response = await fetch(`${API_URL}/quiz/user/${encodeURIComponent(userEmail)}`);
        if (response.ok) {
            const data = await response.json();
            return data.quizzes;
        }
        return [];
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return [];
    }
};

export const saveQuiz = async (userEmail: string, quiz: Quiz): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail, quiz }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error saving quiz:', error);
        return false;
    }
};

export const updateQuizScore = async (userEmail: string, quizId: string, score: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/quiz/${quizId}/score`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail, score }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error updating quiz score:', error);
        return false;
    }
};

export const deleteQuiz = async (userEmail: string, quizId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/quiz/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return false;
    }
};

// --- Quiz Draft Storage (local storage for drafts) ---
const DRAFT_KEY = 'autoquizzer_quiz_draft';

export const saveQuizDraft = (draft: QuizDraft): void => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

export const getQuizDraft = (): QuizDraft | null => {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    return draftJson ? JSON.parse(draftJson) : null;
};

export const clearQuizDraft = (): void => {
    localStorage.removeItem(DRAFT_KEY);
};