import prompts, { PromptObject } from "prompts";
import {
  Book,
  error,
  finished,
  heading,
  reading,
  status,
  statusIcon,
  toRead,
} from "../context.js";
import { shelf } from "../Shelf.js";
import boxen from "boxen";
import chalk from "chalk";
import { formatBook } from "./utility.js";

type options = {
  filter: string;
  verbose: boolean;
};
type filterObject = {
  tags?: string[];
  status?: status;
  author?: string;
  title?: string;
};

const tagFilter: PromptObject<string> = {
  type: "list",
  name: "tags",
  message: "Enter tags (separated with commas)",
  initial: "",
  separator: ",",
};

const statusFilter: PromptObject<string> = {
  type: "multiselect",
  name: "status",
  message: "Select status/es",
  choices: [
    { title: status.toRead, value: status.toRead },
    { title: status.reading, value: status.reading },
    { title: status.finished, value: status.finished },
  ],
  max: 2,
  min: 1,
  hint: "- Space to select. Return to submit",
  instructions: false,
  format: (val) =>
    val.length > 1
      ? `status = '${val[0]}' OR status = '${val[1]}'`
      : `status = '${val[0]}'`,
};

const authorFilter: PromptObject<string> = {
  type: "text",
  name: "author",
  message: "Enter author name (partial name is OK)",
  format: (val) => `author LIKE '%${val}%'`,
};

const titleFilter: PromptObject<string> = {
  type: "text",
  name: "title",
  message: "Enter title/keywords",
  format: (val) => `title LIKE '%${val}%'`,
};

const questions: PromptObject<string> = {
  type: "multiselect",
  name: "properties",
  message: "Filter by?",
  choices: [
    { title: "tags", value: "tags" },
    { title: "status", value: "status" },
    { title: "author", value: "author" },
    { title: "title", value: "title" },
  ],
  max: 2,
  min: 1,
  hint: "- Space to select. Return to submit",
  instructions: false,
};

export const list = async (opts: options) => {
  if (opts.filter) {
    const response = await prompts(questions);

    let filter: filterObject = {};
    for (const property of response.properties) {
      if (property === "tags") {
        const response = await prompts(tagFilter);
        filter.tags = response.tags;
      } else if (property === "status") {
        const response = await prompts(statusFilter);
        filter.status = response.status;
      } else if (property === "author") {
        const response = await prompts(authorFilter);
        filter.author = response.author;
      } else {
        const response = await prompts(titleFilter);
        filter.title = response.title;
      }
    }
    const conditions = Object.values(filter).join(" AND ");
    const sql = `SELECT * FROM books WHERE ${conditions}`;
    shelf.db.all(sql, executeList);
  } else {
    shelf.db.all(`SELECT * FROM books ORDER BY title`, executeList);
  }
  console.log();
};

const executeList = (err: Error | null, rows: Book[]) => {
  if (err) {
    console.log(error("Cannot list books from shelf: ", err));
  } else if (rows.length > 0) {
    console.log(heading("============= Books on your shelf ============="));
    rows.forEach((book) => console.log(formatBook(book)));
  } else {
    console.log(heading("============= Books on your shelf ============="));
    console.log(
      chalk.blueBright(
        boxen("No books found!", { padding: 1, margin: { left: 11 } })
      )
    );
  }
};
