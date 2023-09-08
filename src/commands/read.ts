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
import * as readline from "readline";

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
        // TODO check books that have started reading, if exists, initiate reading loop or update page progress
        console.log(
          warning(`No books found on your shelf with '${title}' in the title`)
        );
      }
    }
  );
  console.log();
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
      type: (prev, values) => (values.action === "progress" ? "number" : null),
      name: "progress",
      message: "Current page number: ",
      validate: (progress) =>
        progress >= 0 && progress <= book.pages
          ? true
          : "Page cannot be negative or exceed total pages in book",
      format: (value) => (book.progress = value),
    },
    {
      type: (prev, values) =>
        values.action === "bookmark" || values.action === "note"
          ? "number"
          : null,
      name: "bookmark",
      message: (prev, values) =>
        values.action === "bookmark"
          ? "Enter page number to bookmark"
          : "Enter page number of note (if applicable)",
    },
    {
      type: (prev, values) => (values.action === "note" ? "text" : null),
      name: "note",
      message: "Enter notes",
    },
  ];
  const readingProgress = getReadingProgress();
  const onSubmit = (prompt: PromptObject, answer: any) => {
    if (prompt.name === "action" && answer === "progress") {
      console.log(chalk.bold.white(`Current progress: `));
      readingProgress.start(book.pages, book.progress);
      readingProgress.stop();
    }
    if (prompt.name === "progress") {
      console.log(chalk.bold.white(`New progress: `));
      readingProgress.start(book.pages, book.progress);
      readingProgress.stop();
    }
  };

  const response = await prompts(questions, { onSubmit });
  console.log("processing information obtained..");

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

const executeKeepReading = async (book: Book) => {
  const readingProgress = getReadingProgress();
  console.log(chalk.bold.white(`Currently reading '${book.title}'`));

  const questions: PromptObject<string>[] = [
    {
      type: "toggle",
      name: "update",
      message: "Update progress?",
      initial: false,
      active: "yes",
      inactive: "no",
    },
    {
      type: (prev) => (prev ? "number" : null),
      name: "progress",
      message: "Enter current page",
      validate: (progress) =>
        progress >= 0 && progress <= book.pages
          ? true
          : "Page cannot be negative or exceed total pages in book",
      format: (value) => (book.progress = value),
    },
  ];
  const onSubmit = (prompt: any, answer: any) => {
    if (prompt.name === "update") {
      console.log(chalk.bold.white(`Current progress: `));
    } else {
      console.log(chalk.bold.white(`Updated progress: `));
    }
    readingProgress.start(book.pages, book.progress);
    readingProgress.stop();
  };
  const response = await prompts(questions, { onSubmit });

  if (response.update)
    shelf.db.exec(
      `UPDATE books SET progress=${response.progress} WHERE isbn=${book.isbn}`,
      (err: Error | null) => {
        if (err) {
          console.log(
            error(`ERROR updating book progress for '${book.title}': `, err)
          );
        } else {
          console.log(
            success(
              `Successfully updated reading progress for '${book.title}'!`
            )
          );
        }
      }
    );
};