import { BIBLE_BOOKS } from "./constants/en/bible-constants";
import type { Command } from "./contracts/command.type";
import { BookName } from "./value-objects/book-name";
import { Chapter } from "./value-objects/chapter";
import { Verse } from "./value-objects/verse";

export enum QueryTypeEnum {
  Book = "book",
  Chapter = "chapter",
  Verse = "verse",
  Word = "word",
}

export class SearchBibleCommand<T extends string> implements Command<T> {
  constructor(private readonly bibleText: string) {}

  help(): string {
    return `
    Search the bible by book, chapter, verse or word.

    Usage:
    search <query>

    Examples:
    search John 3:16 (verse)
    search John 3 (chapter)
    search John (book)
    `;
  }

  async run(args: string[]): Promise<T> {
    try {
      const queryType = this.parseQueryType(args);

      const queryStrategies = {
        [QueryTypeEnum.Book]: () => this.searchByBook(args),
        [QueryTypeEnum.Chapter]: () => this.searchByChapter(args),
        [QueryTypeEnum.Verse]: () => this.searchByVerse(args),
        [QueryTypeEnum.Word]: () => this.searchByWord(args),
      };

      return await queryStrategies[queryType]();
    } catch (error) {
      console.error(this.help());
      return Promise.reject(error);
    }
  }

  private async searchByBook(args: string[]): Promise<T> {
    const [query] = args;
    const lowerQuery = query?.toLowerCase();
    const lowerCaseBibleText = this.bibleText.toLowerCase();

    const bibleBookIndex = BIBLE_BOOKS.findIndex(
      (b) => b.name.toLowerCase() === lowerQuery
    );

    const book = BIBLE_BOOKS[bibleBookIndex];

    if (!book) {
      return Promise.reject(new Error(`Book ${query} not found`));
    }

    let searchName = book.fullName.toLowerCase();
    let bookIndex = lowerCaseBibleText.indexOf(searchName);

    if (bookIndex < 0) {
      return Promise.reject(new Error(`Book ${query} not found in text`));
    }

    const nextBook = BIBLE_BOOKS[bibleBookIndex + 1];

    const nextSearchName = nextBook?.fullName.toLowerCase();
    const nextBookIndex = nextSearchName
      ? lowerCaseBibleText.indexOf(nextSearchName)
      : this.bibleText.length;

    return Promise.resolve(this.bibleText.slice(bookIndex, nextBookIndex) as T);
  }

  private searchByChapter(args: string[]): Promise<T> {
    let [name, chapter] = args;

    const bookName = BookName.make(name);

    if (!chapter) {
      chapter = "1";
    }

    const bookChapter = Chapter.make({ number: chapter });

    const book = BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === bookName.value.toLowerCase()
    );

    if (!book) {
      throw new Error(`Book ${bookName.value} not found`);
    }

    const bookStartIndex = this.bibleText.indexOf(book.fullName);
    const bookText = this.bibleText.slice(bookStartIndex);

    const chapterIndex = bookText.indexOf(`${bookChapter.number}:1`);

    if (!bookChapter.number) {
      throw new Error("Chapter number is required");
    }

    const nextChapter = `${bookChapter.number + 1}:1`;
    const nextChapterIndex = bookText.indexOf(nextChapter);

    return Promise.resolve(bookText.slice(chapterIndex, nextChapterIndex) as T);
  }

  private searchByVerse(args: string[]): Promise<T> {
    const [query] = args;

    let [name, chapter, verse] =
      query?.match(/^(.+?)\s+(\d+)\:(\d+)$/)?.slice(1) || [];

    const bookName = BookName.make(name);
    const bookChapter = Chapter.make({ number: chapter ?? "1" });
    const bookVerse = Verse.make(verse);

    const book = BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === bookName.value.toLowerCase()
    );

    if (!book) {
      throw new Error(`Book ${bookName} not found`);
    }

    const bookStartIndex = this.bibleText.indexOf(book.name);
    const bookText = this.bibleText.slice(bookStartIndex);

    const verseIndex = bookText.indexOf(
      `${bookChapter.number}:${bookVerse.value}`
    );

    const nextVerse = `${chapter}:${Number(verse) + 1}`;
    const nextVerseIndex = bookText.indexOf(nextVerse);

    return Promise.resolve(bookText.slice(verseIndex, nextVerseIndex) as T);
  }

  private searchByWord(args: string[]): Promise<T> {
    const [query] = args;

    if (!query) {
      throw new Error("Query is required");
    }

    throw new Error("Not implemented");
  }

  private parseQueryType(args: string[]): QueryTypeEnum {
    const text = args.join(" ");
    const [_, book, chapter, verse] =
      text.match(/^(.+?)(?:\s+(\d+)(?::(\d+))?)?$/) || [];

    if (verse) {
      return QueryTypeEnum.Verse;
    }

    if (chapter) {
      return QueryTypeEnum.Chapter;
    }

    if (book) {
      return QueryTypeEnum.Book;
    }

    return QueryTypeEnum.Word;
  }
}
