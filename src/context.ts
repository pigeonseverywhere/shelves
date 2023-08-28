import chalk from 'chalk';
import sqlite3 from 'sqlite3';

/*============================ STYLING ==============================*/ 
export const error = chalk.bold.red;
export const warning = chalk.hex('#FFA500'); // Orange color
export const success = chalk.greenBright;
export const title = chalk.bold.white;
 
export const toRead = chalk.yellow;
export const reading = chalk.blue;
export const finished = chalk.green;

/*============================ DATABASE ==============================*/ 
export let db = new sqlite3.Database("./shelves.db", 
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
    (err) => { 
        if (err) console.log("ERROR: ", err);
        else console.log("DB CONN"); 
    });