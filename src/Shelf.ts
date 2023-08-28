import sqlite3, { Database } from "sqlite3";
import path from "path";
import { db_path, error } from "./context.js";

export class Shelf {
  db: Database;
  constructor() {
    this.db = new sqlite3.Database(
      db_path,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_URI,
      (err) => {
        if (err) {
          console.log(error("ERROR: ", err, db_path));
        } else {
          this.createTables();
        }
      }
    );
  }

  createTables = () => {
    const books_sql = `
        CREATE TABLE IF NOT EXISTS books (
        title TEXT NOT NULL,
        author TEXT,
        isbn TEXT,
        status TEXT NOT NULL,
        pages INTEGER,
        progress INTEGER,
        rating INTEGER,
        review TEXT,
        PRIMARY KEY (isbn, title)
        )
    `;
    const notes_sql = `
        CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        page INTEGER,
        content TEXT,
        FOREIGN KEY (book_id) 
            REFERENCES books (id)
        ) 
    `;

    const tags_sql = `
        CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL 
        )          
    `;

    const book_tags_sql = `
        CREATE TABLE IF NOT EXISTS book_tags (
        book_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (book_id) 
            REFERENCES books (id)
        FOREIGN KEY (tag_id)
            REFERENCES tags (id)
        PRIMARY KEY (book_id, tag_id) 
        )
    `;
    this.db.serialize(() => {
      this.db.run(books_sql, (err) => {
        if (err) {
          console.log(error("ERROR: ", err));
        }
      });
      this.db.run(notes_sql, (err) => {
        if (err) {
          console.log(error("ERROR: ", err));
        }
      });
      this.db.run(tags_sql, (err) => {
        if (err) {
          console.log(error("ERROR: ", err));
        }
      });
      this.db.run(book_tags_sql, (err) => {
        if (err) {
          console.log(error("ERROR: ", err));
        }
      });
    });
  };
}
