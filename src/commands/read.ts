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
import { formatBook, getReadingProgress } from "./utility.js";
import chalk from "chalk";

export const read = async (title: string) => {
  shelf.db.all(
    `SELECT * from books where title LIKE '%${title}%'`,
    async (err: Error, rows: Book[]) => {
      if (err) {
        console.log(
          error(`ERROR finding book with ${title} in your shelf: `, err)
        );
        return;
      }

      // Display all related titles
      if (rows.length !== 0) {
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
          message: "Select the book to start/keep reading",
          choices: results,
        });
        if (toRead.book.status === status.toRead) {
          await executeStartReading(toRead.book);
        } else {
          let keepReading = await readingLoop(toRead.book);
          while (keepReading.valueOf()) {
            keepReading = await readingLoop(toRead.book);
          }
        }
      } else {
        console.log(
          warning(`No books found on your shelf with '${title}' in the title`)
        );
      }
    }
  );
};

const readingLoop = async (book: Book) => {
  const questions: PromptObject<string>[] = [
    {
      type: "select",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { title: "Update page progress", value: "progress" },
        { title: "Add bookmark", value: "bookmark" },
        { title: "Add note", value: "note" },
        { title: "Stop reading", value: "stop" },
      ],
    },
    {
      type: (_prev: any, values: any) =>
        values.action === "progress" ? "number" : null,
      name: "progress",
      message: "Current page number: ",
      validate: (progress) =>
        progress >= 0 && progress <= book.pages
          ? true
          : "Page cannot be negative or exceed total pages in book",
      format: (value) => (book.progress = value),
    },
    {
      type: (_prev: any, values: any) =>
        values.action === "bookmark" || values.action === "note"
          ? "number"
          : null,
      name: "bookmark",
      message: (_prev: any, values: any) =>
        values.action === "bookmark"
          ? "Enter page number to bookmark"
          : "Enter page number of note (if applicable)",
    },
    {
      type: (_prev: any, values: any) =>
        values.action === "note" ? "text" : null,
      name: "note",
      message: "Enter notes",
    },
  ];
  const readingProgress = getReadingProgress();
  const onSubmit = (prompt: PromptObject, answer: any, answers: any) => {
    if (prompt.name === "action" && answer === "progress") {
      console.log(chalk.bold.white(`Current progress: `));
      readingProgress.start(book.pages, book.progress);
      readingProgress.stop();
    } else if (prompt.name === "progress") {
      console.log(chalk.bold.white(`New progress: `));
      readingProgress.start(book.pages, book.progress);
      readingProgress.stop();
      shelf.db.run(
        `UPDATE books SET progress=${answer} WHERE isbn='${book.isbn}'`,
        (err: Error | null) => {
          if (err) console.log(error(`ERROR updatng book progress: `, err));
          else {
            console.log(
              success(`Successfully updated progress for ${book.title}`)
            );
          }
        }
      );
      if (book.progress === book.pages) {
        shelf.db.run(
          `UPDATE books SET status='${status.finished}' WHERE isbn='${book.isbn}'`,
          (err: Error | null) => {
            if (err) console.log(error(`ERROR updatng book progress: `, err));
          }
        );
      }
    } else if (prompt.name === "bookmark" && answers.action === "bookmark") {
      shelf.db.run(
        `INSERT INTO notes (isbn, page, content) VALUES (${book.isbn}, ${answer}, "")`,
        (err: Error | null) => {
          if (err) console.log(error(`ERROR inserting bookmark: `, err));
          else {
            console.log(
              success(
                `Successfully added bookmark to ${book.title} on page ${answer}!`
              )
            );
          }
        }
      );
    } else if (prompt.name === "note") {
      shelf.db.run(
        `INSERT INTO notes (isbn, page, content) VALUES (${book.isbn}, ${answers.bookmark}, "${answer}")`,
        (err: Error | null) => {
          if (err) console.log(error(`ERROR inserting bookmark: `, err));
          else {
            console.log(success(`Successfully added a note to ${book.title}!`));
          }
        }
      );
    }
  };

  const response = await prompts(questions, { onSubmit });
  return response.action === "stop" ? false : true;
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
      type: (prev: boolean) => (prev ? "number" : null),
      name: "pages",
      message: "Total pages: ",
    },
    {
      type: (_prev: any, values: any) => (values.track ? "number" : null),
      name: "progress",
      initial: 0,
      message: "Enter start page: ",
      validate: (value: number) => {
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
  shelf.db.exec(sql, (err: Error | null) => {
    if (err) {
      console.log(error(`ERROR starting book ${book.title}:`, err));
    } else {
      console.log(success(`Successfully marked ${book.title} as 'Reading'!`));
      console.log(formatBook(book));
      if (response.track) {
        const readingProgress = getReadingProgress();
        readingProgress.start(
          response.pages ? response.pages : book.pages,
          response.progress
        );
        readingProgress.stop();
      }
    }
  });
};
