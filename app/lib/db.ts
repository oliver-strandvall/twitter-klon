import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "index.db");

  let db: any = null

export function getDb() {
  if(db) {
    return db
  }

  db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT,
      userId INTEGER,
      expiresAt INTEGER
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      userId INTEGER,
      createdAt INTEGER,
      userName TEXT,
      name TEXT
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      postId INTEGER
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      userId INTEGER,
      postId INTEGER,
      createdAt INTEGER,
      username TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS followers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followerId INTEGER,
      followingId INTEGER,
      createdAt INTEGER
    )
  `);

  return db;
}