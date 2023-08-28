import { Database, sqlite3 } from "sqlite3";
import { Book, BookID, error, success } from "./context.js";

export class Bookshelf {
  db: Database;
  reading: boolean;
  book: BookID;

  constructor(db: Database) {
    this.db = db;
    this.reading = false;
    this.book = -1;

    const new_bookshelf = `
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
    this.db.run(new_bookshelf);
  }

  addBook(newBook: Book) {
    this.getBookByISBN(newBook.isbn).then((res) => {
      console.log(res);
    });

    return;
    const sql = `INSERT INTO books 
                (${Object.keys(newBook).join(", ")}) 
            VALUES 
                (${Object.keys(newBook)
                  .map((key) => "?")
                  .join(", ")})`;

    this.db.run(sql, Object.values(newBook), (err) => {
      if (err) {
        console.log(
          error(`Unable to add ${newBook.title} to your shelf: `, err)
        );
      } else {
        console.log(
          success(`Successfully added ${newBook.title} to your collection!`)
        );
      }
    });
  }

  async listBooks(/*callback: Function*/) {
    // this.db.all(`SELECT * FROM books ORDER BY title`, callback);
    return await this.db.all(`SELECT * FROM books ORDER BY title`);
  }

  getBookByTitle() {}

  getBookByAuthor() {}

  async getBookByISBN(isbn: string) {
    return await this.db.get(
      `SELECT * 
        FROM books 
        WHERE isbn = ?`,
      isbn
    );
  }

  openBook(id: BookID) {
    this.reading = true;
    this.book = id;
  }

  removeBook() {}
}
