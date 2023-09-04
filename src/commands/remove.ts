import prompts, { Choice, PromptObject } from "prompts";
import { shelf } from "../Shelf.js";
import { Book, error, success, warning } from "../context.js";
import chalk from "chalk";

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
    if (rows) {
      const results: Choice[] = [];
      rows.forEach((row: Book) =>
        results.push({
          title: `'${row.title}' by ${row.author}`,
          value: row,
        })
      );

      const toRemove = await prompts({
        type: "select",
        name: "book",
        message: "Select the book to start reading",
        choices: results,
      });

      const confirm: PromptObject<string> = {
        type: "toggle",
        name: "value",
        message: `Do you really want to remove ${toRemove.book.title} from your shelf?`,
        initial: false,
        active: "yes",
        inactive: "no",
      };
      const confirmation = await prompts(confirm);
      if (confirmation.value) {
        executeRemove(toRemove.book);
      } else {
        console.log(warning("Removal aborted"));
      }
    }
  }
};

export const remove = async (title: string) => {
  shelf.db.all(`SELECT * from books where title LIKE '%${title}%'`, search);
};
