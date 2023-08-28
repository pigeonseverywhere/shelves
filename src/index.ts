#!/usr/bin/env npx ts-node --esm

import prompts from "prompts";
import type { PromptObject} from "prompts";
import { program } from "commander";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";
import { Shelf } from "./Shelf.js";
import { update } from "./commands/update.js";
import { remove } from "./commands/remove.js";
import { view } from "./commands/view.js";
import { error, success } from "./context.js";

// Ensure database is initialised
const shelf = new Shelf();
shelf.createTables();

program.option("-v, --version").option("-h, --help");

// TODO add tagging
program.command("add").description("adds a new book to your shelf").action(add);

// TODO
// include tags in filter
// add verbose option
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

// TODO EVEYRHTING
program
  .command("update")
  .description("update information about a book on your shelf")
  .action(update);

program
  .command("remove")
  .description("remove a book from your shelf")
  .action(remove);

// TODO
program
  .command("view")
  .description("view details of a book on your shelf")
  .action(view);

program.command("read").description("start reading a book");

program
  .command("createtag <tag-label>")
  .description("add a new tag")
  .action((label) => {
    shelf.db.run(`INSERT INTO tags (label) VALUES ('${label}')`, (err) => {
      if (err) {
        console.log(error("ERROR: ", err));
      } else {
        console.log(success(`Successfully created new tag '${label}'!`));
      }
    });
  });

program.parse();
const options = program.opts();
