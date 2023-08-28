#!/usr/bin/env npx ts-node --esm

import prompts from "prompts";
import type { PromptObject} from "prompts";
import { program } from "commander";
import { add } from "./commands/add.js";

// add command required info
const questions: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'username',
    message: 'What is your GitHub username?'
  },
  {
    type: 'number',
    name: 'age',
    message: 'How old are you?'
  },
  {
    type: 'text',
    name: 'about',
    message: 'Tell something about yourself',
    initial: 'Why should I?'
  }
];

program
  .option("--v, --version")
  .option("--h, --help");


program
  .command('add')
  .description('adds a new book to your collection')
  .action(add);
    

program.parse();
const options = program.opts();

// Debugging log 
// console.log(JSON.stringify(options));


if (options['help']) {
    console.log(`
        Available commands:
            add - adds a new book 
            list - list all added books
            read - open a existing book as the context for easy annotation and bookmarking
    `)
}

// (async () => {
//     const onSubmit = (prompt: PromptObject<string>, answer: any, answers: any) => console.log(`Thanks I got ${JSON.stringify(answer)} from ${JSON.stringify(prompt)}`);
//     const response = await prompts(questions, { onSubmit } );
//     console.log(`${JSON.stringify(response)}`);
// })();