import prompts, { PromptObject } from "prompts";
import { Shelf } from "../Shelf.js";
import { Book, error, success, warning } from "../context.js";
import chalk from "chalk";

const shelf = new Shelf();

const questions: PromptObject<string>[] = [
  {
    type: "autocomplete",
    name: "search",
    message: "Find book by title, author or isbn",
  },
];

const executeRemove = (select: { isbn: string; title: string }) => {
  shelf.db.run(`DELETE from books WHERE isbn = ?`, select.isbn, (err) => {
    if (err) {
      console.log(error("ERROR:", err));
    } else {
      console.log(success(`Successfully deleted '${select.title}'`));
    }
  });
};

const search = async (err: Error | null, rows: Book[]) => {
  if (err) {
    console.log(error("ERROR: ", err));
  } else {
    let choices: {
      title: string;
      value: { isbn: string; title: string };
    }[] = [];

    rows.forEach((row) => {
      const book = `${row.title} by ${chalk.italic(row.author)} (${chalk.dim(
        "ISBN:",
        row.isbn
      )})`;

      choices.push({
        title: book,
        value: { isbn: row.isbn, title: row.title },
      });
    });
    const question: PromptObject<string> = {
      type: "autocomplete",
      name: "select",
      message: "Find book by title, author or isbn",
      choices: choices,
    };
    const response = await prompts(question);
    const confirm: PromptObject<string> = {
      type: "confirm",
      name: "value",
      message: `Do you really want to remove ${response.select.title} from your shelf?`,
      initial: false,
    };
    const confirmation = await prompts(confirm);
    if (confirmation.value) {
      executeRemove(response.select);
    } else {
      console.log(warning("Removal aborted"));
    }
  }
};

export const remove = async () => {
  // get all books
  // get user to search
  // confirm delete
  shelf.db.all(`SELECT title, author, isbn FROM books`, search);
};
