#!/usr/bin/env npx ts-node --esm

import { program } from "commander";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";
import { shelf } from "./Shelf.js";
import { update } from "./commands/update.js";
import { remove } from "./commands/remove.js";
import { view } from "./commands/view.js";
import { error, success } from "./context.js";
import { read } from "./commands/read.js";

shelf.createTables();

program.option("-v, --version").option("-h, --help").version("v1.0.11");

// TODO add tagging
program.command("add").description("adds a new book to your shelf").action(add);

// TODO
// include tags in filter
program
  .command("list")
  .description("list all books in your shelf")
  .option(
    "-v, --verbose",
    "include reviews and progress bars when applicable",
    false
  )
  .option("-f, --filter", "filter books by options")
  .action((options) => list(options));

program
  .command("update")
  .argument(
    "<title>",
    "title of book to update (please encluse multi-word titles in quotation marks)"
  )
  .description("update information about a book on your shelf")
  .action(update);

program
  .command("remove")
  .argument(
    "<title>",
    "title of book to remove (please enclose multi-word titles in quotation marks"
  )
  .description("remove a book from your shelf")
  .action((title) => remove(title));

program
  .command("view")
  .argument(
    "<title>",
    "title of book to view (please enclose multi-word titles in quotation marks)"
  )
  .option(
    "-v, --verbose",
    "show notes and bookmarks along with basic data",
    false
  )
  .description("view details of a book on your shelf")
  .action((title, options) => {
    view(title, options);
  });

program
  .command("read")
  .description(
    "start reading a book by specifying a title (please enclose multi-word titles in quotes)"
  )
  .argument("<title>", "title of the book to start reading")
  .action((title: string) => {
    read(title);
  });

program
  .command("createtag <tag-label>")
  .description("add a new tag")
  .action((label) => {
    shelf.db.run(`INSERT INTO tags (label) VALUES ('${label}')`, (err) => {
      if (err) {
        console.log(error("ERROR creating new tag: ", err));
      } else {
        console.log(success(`Successfully created new tag '${label}'!`));
      }
    });
  });

program.parse();
const options = program.opts();
