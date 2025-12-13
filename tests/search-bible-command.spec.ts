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

  it("should search the bible by book", async () => {
    const command = new SearchBibleCommand(bibleText);
    const book = faker.helpers.arrayElement(BIBLE_BOOKS);
    const nextBook = BIBLE_BOOKS[BIBLE_BOOKS.indexOf(book) + 1];

    expect(nextBook).not.toBeUndefined();

    const searchName = book.fullName || book.name;
    const nextSearchName = nextBook!.fullName || nextBook!.name;

    const expected = bibleText.slice(
      bibleText.indexOf(searchName),
      bibleText.indexOf(nextSearchName)
    );

    const result = await command.run([book.name]);

    expect(result).toBe(expected);
  });

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
      const bookText = bibleText.slice(bibleText.indexOf(book.name));
      const chapterIndex = bookText.indexOf(chapter);
      const nextChapter = `${chapterNumber + 1}:1`;
      const nextChapterIndex = bookText.indexOf(nextChapter);

      const result = await command.run([`${book.name} ${chapterNumber}`]);

      expect(result).toBe(bookText.slice(chapterIndex, nextChapterIndex));
    }
  );
});
