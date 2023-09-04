import prompts, { Choice } from "prompts";
import { shelf } from "../Shelf.js";
import { Book, error, warning } from "../context.js";
import { formatBook, formatStatus } from "./utility.js";
import chalk from "chalk";
import boxen from "boxen";
import cliProgress from "cli-progress";

type options = {
  verbose: boolean;
};

export const view = async (title: string, options: options) => {
  shelf.db.all(
    `SELECT * from books where title LIKE '%${title}%'`,
    async (err: Error, rows: Book[]) => {
      if (err) {
        console.log(
          error(`ERROR finding book with ${title} in your shelf: `, err)
        );
        return;
      }
      if (rows) {
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
        await executeView(toView.book);
      } else {
        console.log(
          warning(`No books found on your shelf with '${title}' in the title`)
        );
      }
    }
  );
};

const executeView = async (book: Book) => {
  const readingProgress = new cliProgress.SingleBar(
    {
      format: " {bar} | {value}/{total} pages",
    },
    cliProgress.Presets.rect
  );
  // readingProgress.start(book.pages, book.progress);

  const displayText = `
  ${chalk.bold.white("AUTHOR:")}   ${chalk.italic(book.author)}
  ${chalk.bold.white("ISBN:")}     ${chalk.italic(book.isbn)}
  ${chalk.bold.white("STATUS:")}   ${formatStatus(book.status)}
  ${chalk.bold.white("PROGRESS:")} ${book.progress}/${book.pages} pages
  ${chalk.bold.white("RATING:")}   ${book.rating === 0 ? "N/A" : book.rating} 
  ${chalk.bold.white("REVIEW:")}   ${book.review === "" ? "N/A" : book.review}
  `;

  console.log(
    boxen(displayText, {
      padding: 1,
      margin: 1,
      title: chalk.white.bold(book.title),
      titleAlignment: "center",
    })
  );
};
