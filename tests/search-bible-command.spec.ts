import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, it } from "bun:test";
import path from "path";
import { downloadBible } from "..";
import { BIBLE_BOOKS } from "../src/constants/en/bible-constants";
import { SearchBibleCommand } from "../src/search-bible-command";

describe("SearchBibleCommand", () => {
  let bibleText: string;

  beforeAll(async () => {
    const filePath = path.join(process.cwd(), "data", "en", "bible.txt");
    bibleText = await downloadBible(filePath);
  });

  it.each(BIBLE_BOOKS)(
    "should search the bible by book for $name",
    async (book) => {
      const command = new SearchBibleCommand(bibleText);
      const result = await command.run([book.name]);

      const lowerCaseBibleText = bibleText.toLowerCase();
      const searchName = (book.fullName || book.name).toLowerCase();
      const bookIndex = lowerCaseBibleText.indexOf(searchName);

      const currentBookIdx = BIBLE_BOOKS.indexOf(book);
      const nextBook = BIBLE_BOOKS[currentBookIdx + 1];

      if (!nextBook) {
        expect(result).toBe(bibleText.slice(bookIndex));
        return;
      }

      const nextSearchName = (nextBook.fullName || nextBook.name).toLowerCase();
      const nextBookIndex = lowerCaseBibleText.indexOf(nextSearchName);

      expect(result).toBe(bibleText.slice(bookIndex, nextBookIndex));
    }
  );

  it.each(BIBLE_BOOKS)(
    "should search the bible by chapter for $name",
    async (book) => {
      const command = new SearchBibleCommand(bibleText);
      const bookChapters = Array.from(
        { length: book.lastChapter - book.firstChapter + 1 },
        (_, i) => i + book.firstChapter
      );

      const chapterNumber = faker.helpers.arrayElement(bookChapters);
      const chapter = `${chapterNumber}:1`;
      const bookStartIndex = bibleText.indexOf(book.name);
      const bookText = bibleText.slice(bookStartIndex);
      const chapterIndex = bookText.indexOf(chapter);
      const nextChapter = `${chapterNumber + 1}:1`;
      const nextChapterIndex = bookText.indexOf(nextChapter);

      const result = await command.run([`${book.name} ${chapterNumber}`]);

      expect(result).toBe(bookText.slice(chapterIndex, nextChapterIndex));
    }
  );
});
