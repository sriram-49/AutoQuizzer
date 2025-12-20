import express from 'express';
import { getDatabase, saveDatabase } from '../database/db.js';

const router = express.Router();

// Register a new user
router.post('/register', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const db = getDatabase();
    
    // Check if user already exists
    const existingUser = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser[0]?.values.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    db.run('INSERT INTO users (email) VALUES (?)', [email]);
    saveDatabase();
    
    const newUserResult = db.exec('SELECT id, email FROM users WHERE email = ?', [email]);
    const newUser = {
      id: newUserResult[0].values[0][0],
      email: newUserResult[0].values[0][1]
    };

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const db = getDatabase();
    const result = db.exec('SELECT id, email FROM users WHERE email = ?', [email]);

    if (!result[0] || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      id: result[0].values[0][0],
      email: result[0].values[0][1]
    };

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user (verify session)
router.get('/user/:email', (req, res) => {
  const { email } = req.params;

  try {
    const db = getDatabase();
    const result = db.exec('SELECT id, email FROM users WHERE email = ?', [email]);

    if (!result[0] || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      id: result[0].values[0][0],
      email: result[0].values[0][1]
    };

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
