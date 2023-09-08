import sqlite3, { Database } from "sqlite3";
import { db_path, error } from "./context.js";
import fs from "fs";

export class Shelf {
  db: Database;
  constructor(origin: string) {
    let dbexist = false;
    if (fs.existsSync(db_path)) dbexist = true;

    this.db = new sqlite3.Database(
      db_path,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_URI,
      (err) => {
        if (err) {
          console.log(error("ERROR: ", err, db_path));
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
        isbn STRING NOT NULL,
        page INTEGER,
        content TEXT,
        FOREIGN KEY (isbn) 
            REFERENCES books (isbn)
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
          console.log(error("ERROR creating books table: ", err));
        }
      });
      this.db.run(notes_sql, (err) => {
        if (err) {
          console.log(error("ERROR creating notes table: ", err));
        }
      });
      this.db.run(tags_sql, (err) => {
        if (err) {
          console.log(error("ERROR creating tags table: ", err));
        }
      });
      this.db.run(book_tags_sql, (err) => {
        if (err) {
          console.log(error("ERROR creating book tags table: ", err));
        }
      });
    });
  };
}

export const shelf = new Shelf("shelf class");
