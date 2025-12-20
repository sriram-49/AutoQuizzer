import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'autoquizzer.db');

let db = null;

export const initDatabase = async () => {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create quizzes table
  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT NOT NULL,
      created_at TEXT NOT NULL,
      questions TEXT NOT NULL,
      last_score REAL,
      time_limit_minutes INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id)
  `);

  // Save database to file
  saveDatabase();

  console.log('✅ Database initialized successfully');
};

export const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

export const getDatabase = () => db;

export default { initDatabase, getDatabase, saveDatabase };
