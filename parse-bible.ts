import { readFileSync } from "fs";
import { BIBLE_BOOKS } from "./src/constants/en/bible-constants";

const bibleText = readFileSync("./data/en/bible.txt", "utf-8");

interface ChapterData {
  number: number;
  numberOfVerses: number;
}

interface BookData {
  name: string;
  fullName: string;
  chapters: ChapterData[];
}

function parseBible(): BookData[] {
  const books: BookData[] = [];

  for (let i = 0; i < BIBLE_BOOKS.length; i++) {
    const book = BIBLE_BOOKS[i];
    const nextBook = BIBLE_BOOKS[i + 1];

    const bookStartIndex = bibleText.indexOf(book.fullName || book.name);
    if (bookStartIndex === -1) {
      console.error(`Book not found: ${book.name}`);
      continue;
    }

    const bookEndIndex = nextBook
      ? bibleText.indexOf(nextBook.fullName || nextBook.name, bookStartIndex)
      : bibleText.length;

    const bookText = bibleText.slice(bookStartIndex, bookEndIndex);

    const verseRegex = /(\d+):(\d+)/g;
    const chapterVerses = new Map<number, Set<number>>();

    let match;
    while ((match = verseRegex.exec(bookText)) !== null) {
      const chapter = parseInt(match[1], 10);
      const verse = parseInt(match[2], 10);

      if (!chapterVerses.has(chapter)) {
        chapterVerses.set(chapter, new Set());
      }
      chapterVerses.get(chapter)!.add(verse);
    }

    const chapters: ChapterData[] = Array.from(chapterVerses.entries())
      .sort(([a], [b]) => a - b)
      .map(([chapter, verses]) => ({
        number: chapter,
        numberOfVerses: Math.max(...Array.from(verses)),
      }));

    books.push({
      name: book.name,
      fullName: book.fullName || book.name,
      chapters,
    });
  }

  return books;
}

const parsedBooks = parseBible();

console.log(JSON.stringify(parsedBooks, null, 2));
