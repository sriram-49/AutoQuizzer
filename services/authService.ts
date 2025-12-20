import { User } from '../types';

const CURRENT_USER_KEY = 'autoquizzer_currentUser';
const API_URL = '/api';

export const loginUser = async (email: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
};

export const registerUser = async (email: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.status === 409) {
            return null; // User already exists
        }

        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    } catch (error) {
        console.error('Registration error:', error);
        return null;
    }
};

export const logoutUser = (): void => {
    sessionStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
    const userJson = sessionStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
};
