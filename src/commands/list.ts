import { Bookshelf } from "../Bookshelf.js";
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
import { Shelf } from "../Shelf.js";

type options = {
  filter: string;
  verbose: boolean;
};

export const list = (opts: options, shelf: Shelf) => {
  shelf.db.all(`SELECT * FROM books ORDER BY title`, executeList);
};

const executeList = (err: unknown, rows: Book[]) => {
  if (err) {
    console.log(error("Cannot list books from shelf: ", err));
  } else {
    console.log(heading("============= Books on your shelf ==============="));

    rows.forEach((row) => {
      const statusStyle =
        row.status === status.reading
          ? reading
          : row.status === status.toRead
          ? toRead
          : finished;

      console.log(`
${statusStyle(statusIcon(row.status) + row.status)}     '${row.title}' by ${
        row.author ? row.author : "Unknown"
      }
      `);
    });
  }
};
