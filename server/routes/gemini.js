import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config.js';

const router = express.Router();

const API_KEY = config.GEMINI_API_KEY;

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A creative and relevant title for the quiz based on the provided context."
        },
        description: {
            type: Type.STRING,
            description: "A concise, one-line summary of the quiz's content."
        },
        difficulty: {
            type: Type.STRING,
            description: "The estimated difficulty of the quiz. Must be one of 'Easy', 'Medium', or 'Hard'."
        },
        questions: {
            type: Type.ARRAY,
            description: "An array of quiz questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: {
                        type: Type.STRING,
                        description: "The text of the multiple-choice question."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 possible answers for the question.",
                        items: {
                            type: Type.STRING
                        }
                    },
                    correctAnswerIndex: {
                        type: Type.INTEGER,
                        description: "The 0-based index of the correct answer in the 'options' array."
                    }
                },
                required: ["questionText", "options", "correctAnswerIndex"]
            }
        }
    },
    required: ["title", "description", "questions", "difficulty"]
};

// Generate quiz from content
router.post('/generate', async (req, res) => {
  const { content, numQuestions, difficulty } = req.body;

  if (!content || !numQuestions) {
    return res.status(400).json({ error: 'Content and numQuestions are required' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const difficultyInstruction = difficulty
        ? `2. The difficulty level must be exactly ${difficulty}.`
        : `2. Based on the complexity of the context, determine the most appropriate difficulty level for the quiz and include it in the 'difficulty' field. The value must be one of: 'Easy', 'Medium', or 'Hard'.`;
    
    const prompt = `
      Based on the provided context, generate a multiple-choice quiz.
      
      **Context:**
      ${content}
      
      **Instructions:**
      1. Create a quiz with exactly ${numQuestions} questions.
      ${difficultyInstruction}
      3. Each question must have exactly 4 options.
      4. Crucially, generate a concise, one-line description that summarizes the quiz content.
      5. Ensure the questions are relevant to the provided context.
      6. Provide the output in the specified JSON format.
      7. **IMPORTANT**: Do not create questions that refer to the document, the act of studying, or the source material itself. The questions must be about the subject matter directly. Avoid phrases like "According to the provided text...", "Based on the document...", "from the content", "by the given content", "by the provided file", "self study", and similar references. Also, do not include metadata from the document like course names or course codes in the questions or answers.
    `;

    const parts = [{ text: prompt }];

    const request = {
        model: "gemini-2.0-flash-exp",
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    };

    const response = await ai.models.generateContent(request);

    if (!response.text) {
        throw new Error("The AI model returned an empty response.");
    }

    const jsonText = response.text.trim();
    const quizData = JSON.parse(jsonText);

    // Validation
    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions) || 
        quizData.questions.length === 0 || !quizData.difficulty) {
        throw new Error("Invalid quiz data structure");
    }

    if (quizData.questions.some(q => !q.questionText || !q.options || 
        q.options.length !== 4 || q.correctAnswerIndex === undefined || 
        q.correctAnswerIndex < 0 || q.correctAnswerIndex >= 4)) {
        throw new Error("Invalid question structure");
    }

    res.json({ quizData });
  } catch (error) {
    console.error('Gemini API error:', error);
    
    const errorString = String(error);
    if (errorString.includes('SAFETY')) {
      return res.status(400).json({ error: 'Content violated safety policies' });
    }
    if (errorString.includes('400')) {
      return res.status(400).json({ error: 'Invalid request - content might be too long' });
    }
    if (errorString.includes('500') || errorString.includes('503')) {
      return res.status(503).json({ error: 'AI service temporarily unavailable' });
    }

    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

export default router;
