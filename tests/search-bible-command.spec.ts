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
      const searchName = book.fullName.toLowerCase();
      const bookIndex = lowerCaseBibleText.indexOf(searchName);

      const currentBookIdx = BIBLE_BOOKS.indexOf(book);
      const nextBook = BIBLE_BOOKS[currentBookIdx + 1];

      if (!nextBook) {
        expect(result).toBe(bibleText.slice(bookIndex));
        return;
      }

      const nextSearchName = nextBook.fullName.toLowerCase();
      const nextBookIndex = lowerCaseBibleText.indexOf(nextSearchName);

      expect(result).toBe(bibleText.slice(bookIndex, nextBookIndex));
    }
  );

  it.each(BIBLE_BOOKS)(
    "should search the bible by chapter for $name",
    async (book) => {
      const command = new SearchBibleCommand(bibleText);

      const chapterNumber = Number(
        faker.helpers.arrayElement(book.chapters.map((c) => c.number))
      );

      const chapter = `${chapterNumber}:1`;
      const bookStartIndex = bibleText.indexOf(book.fullName);
      const bookText = bibleText.slice(bookStartIndex);
      const chapterIndex = bookText.indexOf(chapter);
      const nextChapter = `${chapterNumber + 1}:1`;
      const nextChapterIndex = bookText.indexOf(nextChapter);

      const result = await command.run([book.name, chapterNumber.toString()]);

      expect(result).toBe(bookText.slice(chapterIndex, nextChapterIndex));
    }
  );

  it.each(BIBLE_BOOKS)(
    "should search the bible by verse for $name",
    async (book) => {
      const command = new SearchBibleCommand(bibleText);

      const chapterNumber = faker.helpers.arrayElement(
        book.chapters.map((c) => c.number)
      );

      const verseNumber = faker.helpers.arrayElement(
        book.chapters.flatMap((c) => {
          expect(c.numberOfVerses).not.toBeUndefined();

          return Array.from({ length: c.numberOfVerses ?? 0 }, (_, i) => i + 1);
        })
      );

      const verse = `${chapterNumber}:${verseNumber}`;
      const result = await command.run([book.name, verse]);

      const bookStartIndex = bibleText.indexOf(book.name);
      const bookText = bibleText.slice(bookStartIndex);
      const verseIndex = bookText.indexOf(verse);
      const nextVerseIndex = bookText.indexOf(
        `${chapterNumber}:${verseNumber + 1}`
      );

      expect(result).toBe(bookText.slice(verseIndex, nextVerseIndex));
    }
  );

  it("should search the bible by word", async () => {
    const command = new SearchBibleCommand(bibleText);
    const bibleWords = bibleText.split(" ");
    const wordIndex = faker.number.int({ min: 0, max: bibleWords.length - 1 });
    const word = bibleWords[wordIndex]!;

    expect(word).not.toBeUndefined();

    const result = await command.run(["-w", word]);

    result.split("\n").forEach((line) => {
      if (line.trim()) {
        expect(line).toMatch(new RegExp(word, "gi"));
      }
    });
  });
});
