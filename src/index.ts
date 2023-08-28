#!/usr/bin/env npx ts-node --esm

import prompts from "prompts";
import type { PromptObject} from "prompts";
import { program } from "commander";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";
import { Shelf } from "./Shelf.js";
import { update } from "./commands/update.js";
import { remove } from "./commands/remove.js";

// Ensure database is initialised
const shelf = new Shelf();
shelf.createTables();

program.option("-v, --version").option("-h, --help");

program.command("add").description("adds a new book to your shelf").action(add);

program
  .command("list")
  .description("list all books in your shelf")
  .option("-f, --filter <type>", "filter by", "tag")
  .option("-v, --verbose", "Include notes and bookmarks in list", false)
  .action((options) => list(options));

program
  .command("update")
  .description("update information about a book on your shelf")
  .action(update);

program
  .command("remove")
  .description("remove a book from your shelf")
  .action(remove);

program.parse();
const options = program.opts();
