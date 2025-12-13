import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, it } from "bun:test";
import path from "path";
import { downloadBibleTxt } from "..";
import { BIBLE_BOOKS } from "../src/constants/en/bible-constants";
import { SearchBibleCommand } from "../src/search-bible-command";

describe("SearchBibleCommand", () => {
  let bibleText: string;

  beforeAll(async () => {
    const filePath = path.join(process.cwd(), "data", "en", "bible.txt");
    bibleText = await downloadBibleTxt(filePath);
  });

  it("should search the bible by book", () => {
    const command = new SearchBibleCommand(bibleText);
    const book = faker.helpers.arrayElement(BIBLE_BOOKS);
    const nextBook = BIBLE_BOOKS[BIBLE_BOOKS.indexOf(book) + 1];

    expect(nextBook).not.toBeUndefined();

    const expected = bibleText.slice(
      bibleText.indexOf(book),
      bibleText.indexOf(nextBook!)
    );

    expect(command.run([book])).resolves.toBe(expected);
  });
});
