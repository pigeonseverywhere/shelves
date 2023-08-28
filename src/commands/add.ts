
import prompts from "prompts";
import type { PromptObject} from "prompts";
import { finished, reading, success, toRead } from "../context.js";
import {db } from "../database.js"
// add command required info
const questions: PromptObject<string>[] = [
    {
      type: 'text',
      name: 'title',
      message: 'Title of the book'
    },
    {
      type: 'text',
      name: 'author',
      message: 'Author of the book'
    },
    {
      type: 'number',
      name: 'isbn',
      message: 'Enter the ISBN (optional)',
      initial: '',
      validate: isbn => (isbn.toString().match(/\d{13}/) || '') ? true: 'The ISBN should be 13 digits long'
    },
    {
        type: 'select',
        name: 'status',
        message: 'Select book status',
        choices: [
            { title: toRead("To Read")},
            { title: reading("Reading")},
            { title: finished("Finished")}
          ],
    },
    {
        type: 'list',
        name: 'tags',
        message: 'Enter some tags',
        initial: '',
        separator: ','
      }
  ];


export const add = async () => {
    const response = await prompts(questions);
    execute(response.title, response.author, response.isbn.toString(), response.status) 
}

export const execute = (title: string, author: string, isbn: string, status: string) => {
    db.run("CREATE TABLE foo (num)");
    console.log(success(`Successfully added ${title} to your collection!`))


}