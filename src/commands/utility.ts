import prompts from "prompts";
import type { PromptObject} from "prompts";
import { program } from "commander";
import {
  Book,
  finished,
  reading,
  status,
  statusIcon,
  toRead,
} from "../context.js";
import chalk from "chalk";
import cliProgress from "cli-progress";

export const getReadingProgress = () => {
  return new cliProgress.SingleBar(
    {
      forceRedraw: true,
      format: " [{bar}] {percentage}% | {value}/{total} pages read",
    },
    cliProgress.Presets.rect
  );
};


export const formatStatus = (bookStatus: status) => {
  const statusStyle =
    bookStatus === status.reading
      ? reading
      : bookStatus === status.toRead
      ? toRead
      : finished;
  return `${statusStyle(statusIcon(bookStatus) + bookStatus)}`;
};

export const formatBook = (book: Book) => {
  // const statusStyle =
  //   book.status === status.reading
  //     ? reading
  //     : book.status === status.toRead
  //     ? toRead
  //     : finished;
  return `${formatStatus(book.status)}     '${book.title}' by ${chalk.italic(
    book.author ? book.author : "Unknown"
  )} ${chalk.dim(`(ISBN: ${book.isbn})`)}`;
};


// export const getBook = () => 

export const help = () => {
    console.log("show help")
}