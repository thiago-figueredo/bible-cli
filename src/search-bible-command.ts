import { match, P } from "ts-pattern";
import { BIBLE_BOOKS } from "./constants/en/bible-constants";
import type { Command } from "./contracts/command.type";

export enum QueryTypeEnum {
  Book = "book",
  Chapter = "chapter",
  Verse = "verse",
  Word = "word",
}

export class SearchBibleCommand<T extends string> implements Command<T> {
  constructor(private readonly bibleText: string) {}

  async run(args: string[]): Promise<T> {
    const [query] = args;

    this.validateQueryType(query);

    const queryType = this.parseQueryType(query!.trim());

    const queryStrategies = {
      [QueryTypeEnum.Book]: () => this.searchByBook(query!),
      [QueryTypeEnum.Chapter]: () => this.searchByChapter(query!),
      [QueryTypeEnum.Verse]: () => this.searchByVerse(query!),
      [QueryTypeEnum.Word]: () => this.searchByWord(query!),
    };

    return await queryStrategies[queryType]();
  }

  private async searchByBook(query: string): Promise<T> {
    const lowerQuery = query.toLowerCase();
    const lowerCaseBibleText = this.bibleText.toLowerCase();

    const book = BIBLE_BOOKS.find((b) => b.name.toLowerCase() === lowerQuery);

    if (!book) {
      return Promise.reject(new Error(`Book ${query} not found`));
    }

    const searchName = (book.fullName || book.name).toLowerCase();
    const bookIndex = lowerCaseBibleText.indexOf(searchName);

    if (bookIndex < 0) {
      return Promise.reject(new Error(`Book ${query} not found in text`));
    }

    const currentBookIdx = BIBLE_BOOKS.indexOf(book);
    const nextBook = BIBLE_BOOKS[currentBookIdx + 1];

    if (!nextBook) {
      return Promise.resolve(this.bibleText.slice(bookIndex) as T);
    }

    const nextSearchName = (nextBook.fullName || nextBook.name).toLowerCase();
    const nextBookIndex = lowerCaseBibleText.indexOf(nextSearchName);

    return Promise.resolve(this.bibleText.slice(bookIndex, nextBookIndex) as T);
  }

  private searchByChapter(query: string): Promise<T> {
    let [bookName, chapter] = query.match(/^(.+?)\s+(\d+)$/)?.slice(1) || [];

    if (!bookName) {
      throw new Error("Book name is required");
    }

    if (!chapter) {
      chapter = "1";
    }

    if (!Number.isInteger(Number(chapter))) {
      throw new Error("Chapter must be a integer number");
    }

    const book = BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === bookName.toLowerCase()
    );

    if (!book) {
      throw new Error(`Book ${bookName} not found`);
    }

    const bookStartIndex = this.bibleText.indexOf(book.name);
    const bookText = this.bibleText.slice(bookStartIndex);

    const chapterIndex = bookText.indexOf(`${chapter}:1`);

    const nextChapter = `${Number(chapter) + 1}:1`;
    const nextChapterIndex = bookText.indexOf(nextChapter);

    return Promise.resolve(bookText.slice(chapterIndex, nextChapterIndex) as T);
  }

  private searchByVerse(query: string): Promise<T> {
    throw new Error("Not implemented");
  }

  private searchByWord(query: string): Promise<T> {
    throw new Error("Not implemented");
  }

  private validateQueryType(query?: string): void {
    if (!(query as any satisfies QueryTypeEnum)) {
      throw new Error(
        `Query type must be one of: ${Object.values(QueryTypeEnum).join(", ")}`
      );
    }
  }

  private parseQueryType(query: string): QueryTypeEnum {
    return match(query)
      .with(
        P.when((query) =>
          BIBLE_BOOKS.map((b) => b.name.toLowerCase()).includes(
            query.toLowerCase()
          )
        ),
        () => QueryTypeEnum.Book
      )
      .with(
        P.when((query) => query.match(/\s+\d+\:\d+$/)),
        () => QueryTypeEnum.Verse
      )
      .with(
        P.when((query) => query.match(/\s+\d+$/)),
        () => QueryTypeEnum.Chapter
      )
      .otherwise(() => QueryTypeEnum.Word);
  }
}
