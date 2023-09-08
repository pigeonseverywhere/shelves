import prompts from "prompts";
import type { Choice, PromptObject } from "prompts";
import { shelf } from "../Shelf.js";
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
import { formatBook } from "./utility.js";
import { createSourceMapSource } from "typescript";


export const update = (title: string) => {
  shelf.db.all(
    `SELECT * from books where title LIKE '%${title}%'`,
    async (err: Error, rows: Book[]) => {
      if (err) {
        console.log(
          error(`ERROR finding book with ${title} in your shelf: `, err)
        );
        return;
      }

      if (rows.length !== 0) {
        const results: Choice[] = [];
        rows.forEach((row: Book) =>
          results.push({
            title: formatBook(row),
            value: row,
          })
        );
        const toUpdate = await prompts({
          type: "select",
          name: "book",
          message: "Select the book to update",
          choices: results,
        });
        await executeUpdate(toUpdate.book);
      } else {
        console.log(
          warning(
            `No books found on your shelf with '${title}' in the title, please double check your spelling`
          )
        );
      }
    }
  );
};

const executeUpdate = async (book: Book) => {
  const update: PromptObject<string>[] = [
    {
      type: "multiselect",
      name: "properties",
      hint: "- Space to select. Return to submit",
      instructions: false,
      message: "Select the properties you want to update",
      min: 1,
      choices: [
        { title: "Title", value: "title" },
        { title: "Author", value: "author" },
        { title: "ISBN", value: "isbn" },
        { title: "Status", value: "status" },
        { title: "Pages", value: "pages" },
        { title: "Progress", value: "progress" },
      ],
    },
    {
      type: (prev, values) => {
        return values.properties.includes("title") ? "text" : null;
      },
      name: "title",
      message: "Update title to",
    },
    {
      type: (prev, values) => {
        return values.properties.includes("author") ? "text" : null;
      },
      name: "author",
      message: "Update author to",
    },
    {
      type: (prev, values) => {
        return values.properties.includes("isbn") ? "text" : null;
      },
      name: "isbn",
      message: "Update ISBN to",
      validate: (isbn) =>
        isbn.match(/\d{13}/) || isbn.match(/^$/)
          ? true
          : "The ISBN should be 13 digits long",
    },
    {
      type: (prev, values) => {
        return values.properties.includes("status") ? "select" : null;
      },
      name: "status",
      message: "Update status to",
      choices: [
        { title: toRead(status.toRead), value: status.toRead },
        { title: reading(status.reading), value: status.reading },
        { title: finished(status.finished), value: status.finished },
      ],
    },
    {
      type: (prev, values) => {
        return values.properties.includes("pages") ? "number" : null;
      },
      name: "pages",
      message: "Update total pages of book to",
    },
    {
      type: (prev, values) => {
        return values.properties.includes("progress") ? "number" : null;
      },
      name: "progress",
      message: "Update reading progress to __ page",
    },
  ];
  const response = await prompts(update);
  // TODO if isbn updated, check if isbn already in db

  // make sql query
  let columns: string[] = [];
  response.properties.forEach((property: string) => {
    if (property === "pages") {
      columns.push(`${property}=${response[property]}`);
    } else {
      columns.push(`${property}='${response[property]}'`);
    }
  });

  const sql = `UPDATE books SET ${columns.join(", ")} WHERE isbn=${
    book.isbn
  } RETURNING *`;
  shelf.db.get(sql, (err: Error, row: Book) => {
    console.log("");
    if (err) {
      console.log(error(`ERROR updateing ${book.title}: `, err));
    } else {
      console.log(success(`Successfully updated ${book.title} to: `));
      console.log(formatBook(row));
    }
  });
};