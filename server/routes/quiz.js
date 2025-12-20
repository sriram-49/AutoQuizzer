import express from 'express';
import { getDatabase, saveDatabase } from '../database/db.js';

const router = express.Router();

// Get all quizzes for a user
router.get('/user/:email', (req, res) => {
  const { email } = req.params;

  try {
    const db = getDatabase();
    
    // Get user ID
    const userResult = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    
    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult[0].values[0][0];

    // Get all quizzes for user
    const quizzesResult = db.exec(`
      SELECT id, topic, title, description, difficulty, created_at, 
             questions, last_score, time_limit_minutes
      FROM quizzes 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    const quizzes = [];
    if (quizzesResult[0]?.values) {
      for (const row of quizzesResult[0].values) {
        quizzes.push({
          id: row[0],
          topic: row[1],
          title: row[2],
          description: row[3],
          difficulty: row[4],
          createdAt: row[5],
          questions: JSON.parse(row[6]),
          lastScore: row[7] !== null ? row[7] : undefined,
          timeLimitMinutes: row[8] !== null ? row[8] : undefined
        });
      }
    }

    res.json({ quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
});

// Create a new quiz
router.post('/', (req, res) => {
  const { email, quiz } = req.body;

  if (!email || !quiz) {
    return res.status(400).json({ error: 'Email and quiz data are required' });
  }

  try {
    const db = getDatabase();
    
    // Get user ID
    const userResult = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    
    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult[0].values[0][0];

    // Insert quiz
    db.run(`
      INSERT INTO quizzes (id, user_id, topic, title, description, difficulty, created_at, questions, last_score, time_limit_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz.id,
      userId,
      quiz.topic,
      quiz.title,
      quiz.description || null,
      quiz.difficulty,
      quiz.createdAt,
      JSON.stringify(quiz.questions),
      quiz.lastScore !== undefined ? quiz.lastScore : null,
      quiz.timeLimitMinutes !== undefined ? quiz.timeLimitMinutes : null
    ]);

    saveDatabase();

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Update quiz score
router.patch('/:quizId/score', (req, res) => {
  const { quizId } = req.params;
  const { email, score } = req.body;

  if (!email || score === undefined) {
    return res.status(400).json({ error: 'Email and score are required' });
  }

  try {
    const db = getDatabase();
    
    // Verify user owns the quiz
    const userResult = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    
    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult[0].values[0][0];

    const quizResult = db.exec('SELECT * FROM quizzes WHERE id = ? AND user_id = ?', [quizId, userId]);
    
    if (!quizResult[0] || quizResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Update score
    db.run('UPDATE quizzes SET last_score = ? WHERE id = ?', [score, quizId]);
    saveDatabase();

    res.json({ message: 'Score updated successfully' });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// Delete a quiz
router.delete('/:quizId', (req, res) => {
  const { quizId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const db = getDatabase();
    
    // Verify user owns the quiz
    const userResult = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    
    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult[0].values[0][0];

    db.run('DELETE FROM quizzes WHERE id = ? AND user_id = ?', [quizId, userId]);
    saveDatabase();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

export default router;
