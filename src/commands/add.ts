
import prompts from "prompts";
import type { PromptObject} from "prompts";
import {
  Book,
  error,
  finished,
  reading,
  status,
  success,
  toRead,
  warning,
} from "../context.js";
import { shelf } from "../Shelf.js";


const questions: PromptObject<string>[] = [
  {
    type: "text",
    name: "title",
    message: "Title of the book",
  },
  {
    type: "text",
    name: "author",
    message: "Author of the book",
  },
  {
    type: "text",
    name: "isbn",
    message: "Enter the ISBN",
    initial: "",
    validate: (isbn) =>
      isbn.match(/\d{13}/) || isbn.match(/^$/)
        ? true
        : "The ISBN should be 13 digits long",
  },
  {
    type: "select",
    name: "status",
    message: "Select book status",
    choices: [
      { title: toRead(status.toRead), value: status.toRead },
      { title: reading(status.reading), value: status.reading },
      { title: finished(status.finished), value: status.finished },
    ],
  },
];

export const add = async () => {
  const response = await prompts(questions);
  response["pages"] = 0;
  response["progress"] = 0;
  response["rating"] = 0;
  response["review"] = "";

  shelf.db.get(
    `SELECT *
      FROM books 
      WHERE isbn = ?`,
    response.isbn,
    (err, row: Book) => {
      if (err) {
        console.log(error("Cannot add book: ", err));
      } else if (row) {
        console.log(warning("Book already exists in your shelf!"));
        console.log(`   
        Title: ${row.title}
        Author: ${row.author}
        ISBN: ${row.isbn}
        `);
      } else {
        executeAdd(<Book>response);
      }
    }
  );
  console.log();
};

const bookExists = () => {};
const executeAdd = (newBook: Book) => {
  const sql = `INSERT INTO books 
                (${Object.keys(newBook).join(", ")}) 
            VALUES 
                (${Object.keys(newBook)
                  .map((key) => "?")
                  .join(", ")})`;

  shelf.db.run(sql, Object.values(newBook), (err) => {
    if (err) {
      console.log(error(`Unable to add ${newBook.title} to your shelf: `, err));
    } else {
      console.log(
        success(`Successfully added ${newBook.title} to your collection!`)
      );
    }
  });
};