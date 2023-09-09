import prompts, { Choice } from "prompts";
import { shelf } from "../Shelf.js";
import { Book, Note, error, status, warning } from "../context.js";
import { formatBook, formatStatus, getReadingProgress } from "./utility.js";
import chalk from "chalk";
import boxen from "boxen";

type options = {
  verbose: boolean;
};

export const view = async (title: string, options: options) => {
  shelf.db.all(
    `SELECT * from books where title LIKE '%${title}%'`,
    async (err: Error | null, rows: Book[]) => {
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
        const toView = await prompts({
          type: "select",
          name: "book",
          message: "Which book do you want to view?",
          choices: results,
        });
        await executeView(toView.book, options.verbose);
      } else {
        console.log(
          warning(`No books found on your shelf with '${title}' in the title`)
        );
      }
    }
  );
};

const verboseOutput = (book: Book) => {
  console.log(
    "\n",
    chalk.bold.white("============= Bookmarks and Notes =============")
  );
  shelf.db.all(
    `SELECT isbn, page, content FROM notes WHERE notes.isbn= "${book.isbn}"`,
    (err: Error | null, rows: Note[]) => {
      if (err) {
        console.log(
          error(`ERROR while retrieving notes for ${book.title}: `, err)
        );
      } else if (rows.length !== 0) {
        rows.forEach((r) => {
          if (r.content === "") {
            console.log(`${r.page}p —— Bookmark`);
          } else {
            console.log(
              boxen(`${r.content}`, {
                title: `Note ${r.page}p`,
                titleAlignment: "center",
              })
            );
          }
        });
      }
    }
  );
};

const executeView = async (book: Book, verbose: boolean) => {
  const readingProgress = getReadingProgress();
  const displayText = `
  ${chalk.bold.white("TITLE:")}    ${chalk.italic(book.title)}
  ${chalk.bold.white("AUTHOR:")}   ${chalk.italic(book.author)}
  ${chalk.bold.white("ISBN:")}     ${chalk.italic(book.isbn)}
  ${chalk.bold.white("STATUS:")}   ${formatStatus(book.status)}
  ${chalk.bold.white("RATING:")}   ${book.rating === 0 ? "N/A" : book.rating} 
  ${chalk.bold.white("REVIEW:")}   ${book.review === "" ? "N/A" : book.review}
  `;

  console.log(displayText);
  if (book.status === status.reading) {
    readingProgress.start(book.pages, book.progress);
    readingProgress.stop();
  }
  if (verbose) verboseOutput(book);
};;
