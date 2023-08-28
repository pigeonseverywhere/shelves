import chalk from 'chalk';
import path from "path";

/*============================ STYLING ==============================*/
export const error = chalk.bold.red;
export const warning = chalk.yellow; // Orange color
export const success = chalk.greenBright;
export const heading = chalk.bold.white;

export const toRead = chalk.yellow;
export const reading = chalk.blue;
export const finished = chalk.green;

export const statusIcon = (stat: status) => {
  const icon =
    stat === status.reading ? "📖" : stat === status.toRead ? "📚" : "\u2705";
  return icon;
};

/*============================ DATA ==============================*/
export enum status {
  toRead = "To Read",
  reading = "Reading",
  finished = "Finished",
}

export type BookID = number;

export type Book = {
  title: string;
  author?: string;
  isbn: string;
  status: status;
  pages: number;
  progress: number;
  rating: number;
  review: string;
};

/*============================ SYSTEM ==============================*/
export const root_dir = path.dirname(import.meta.url);
export const db_path = root_dir + "/shelves.db";