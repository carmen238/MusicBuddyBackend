const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'musicbuddy.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(' Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  // Attivazione delle foreign keys per questa connessione
  db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) console.error("Error while activating FK:", err.message);
    else console.log("Foreign keys activated successfully.");
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      surname TEXT,
      phone TEXT,
      bio TEXT,
      instrument TEXT,
      experienceLevel TEXT,
      genre TEXT,
      isInBand BOOLEAN DEFAULT 0,
      photo_url TEXT DEFAULT NULL,
      latitude DOUBLE DEFAULT 0.0,
      longitude DOUBLE DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `, (err) => {
    if (err) {
      console.error(' Error creating users table:', err);
    } else {
      console.log('Users table created');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS friendships (
      friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      status TEXT,
      sender_last_chat_message TEXT DEFAULT '',
      receiver_last_chat_message TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_friendship UNIQUE (sender_id, receiver_id),
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `, (err) => {
    if (err) {
      console.error(' Error creating users table:', err);
    } else {
      console.log('Users table created');
    }   //status deve essere 'PENDING','ACCEPTED' o 'REJECTED' (quest'ultimo opzionale, puoi semplicemente eliminare la riga)
  });

  db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chatId TEXT NOT NULL,
    senderId INTEGER NOT NULL,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,

    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
  );
`, (err) => {
    if (err) {
      console.error(' Error creating messages table:', err);
    } else {
      console.log('Messages table created');
    }
  });
};


const dbAsync = {
  run: (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    }),

  get: (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }),

  all: (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
};

module.exports = dbAsync;