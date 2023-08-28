import prompts from "prompts";
import type { PromptObject } from "prompts";
import { Shelf } from "../Shelf.js";

const questions: PromptObject<string>[] = [
  {
    type: "autocomplete",
    name: "book",
    message: "Update (search by title, author, or ISBN)",
  },
  {
    type: "text",
    name: "author",
    message: "Author of the book",
  },
  {
    type: "text",
    name: "isbn",
    message: "Enter the ISBN",
    initial: "",
    validate: (isbn) =>
      isbn.match(/\d{13}/) || isbn.match("")
        ? true
        : "The ISBN should be 13 digits long",
  },
  {
    type: "select",
    name: "status",
    message: "Select book status",
    choices: [
      //   { title: toRead(status.toRead), value: status.toRead },
      //   { title: reading(status.reading), value: status.reading },
      //   { title: finished(status.finished), value: status.finished },
    ],
  },
];

export const update = (shelf: Shelf) => {
  // Retrieve list of all books (title, author, isbn)
  // prompt user to search for book to update (prompt autocomplete)
  // prompt user to select check things to update (prompt multiselect)
  // execute update query on db
  // show updae title (in box?)
};
