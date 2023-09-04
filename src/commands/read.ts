import prompts, { Choice, PromptObject } from "prompts";
import { shelf } from "../Shelf.js";
import {
  Book,
  error,
  reading,
  status,
  success,
  toRead,
  warning,
} from "../context.js";
import cliProgress from "cli-progress";
import { formatBook } from "./utility.js";

export const read = async (title: string) => {
  shelf.db.all(
    `SELECT * from books where title LIKE '%${title}%' AND status = 'To Read'`,
    async (err: Error, rows: Book[]) => {
      if (err) {
        console.log(
          error(`ERROR finding book with ${title} in your shelf: `, err)
        );
        return;
      }

      // Display all related titles
      if (rows) {
        const results: Choice[] = [];
        rows.forEach((row: Book) =>
          results.push({
            title: formatBook(row),
            value: row,
          })
        );

        const toRead = await prompts({
          type: "select",
          name: "book",
          message: "Select the book to start reading",
          choices: results,
        });
        await executeStartReading(toRead.book);
      } else {
        // TODO check books that have started reading, if exists, initiate reading loop or update page progress
        console.log(
          warning(`No books found on your shelf with '${title}' in the title`)
        );
      }
    }
  );
};

const executeStartReading = async (book: Book) => {
  const questions: PromptObject<string>[] = [
    {
      type: "toggle",
      name: "track",
      message: "Do you want to track your progress?",
      initial: false,
      active: "yes",
      inactive: "no",
    },
    {
      type: (prev) => (prev ? "number" : null),
      name: "pages",
      message: "Total pages: ",
    },
    {
      type: (_prev, values) => (values.track ? "number" : null),
      name: "progress",
      initial: 0,
      message: "Enter start page: ",
      validate: (value) => {
        return value < book.pages
          ? true
          : "Start page must be lower than total pages in the book!";
      },
    },
  ];
  const onSubmit = (prompt: { name: any }, answer: any, answers: any) => {
    if (prompt.name === "pages") {
      book.pages = answer;
    }
  };
  const onCancel = () => {
    console.log(warning("Action aborted"));
  };

  const response = await prompts(questions, { onSubmit, onCancel });
  const sql = `UPDATE books SET status = '${status.reading}', ${
    response.pages ? `pages = ${response.pages},` : ""
  } progress=${response.track ? response.progress : 0} WHERE isbn='${
    book.isbn
  }'`;
  shelf.db.exec(sql, (err) => {
    if (err) {
      console.log(error(`ERROR starting book ${book.title}:`, err));
    } else {
      console.log(success(`Successfully marked ${book.title} as 'Reading'!`));
      console.log(formatBook(book));
      if (response.track) {
        const readingProgress = new cliProgress.SingleBar(
          {
            format: " {bar} | {value}/{total} pages",
          },
          cliProgress.Presets.rect
        );
        readingProgress.start(
          response.pages ? response.pages : book.pages,
          response.progress
        );
        readingProgress.stop();
      }
    }
  });
};
