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
    query = query.toLowerCase();

    const lowerCaseBibleText = this.bibleText.toLowerCase();
    const bookIndex = lowerCaseBibleText.indexOf(query);
    const nextBook =
      BIBLE_BOOKS[BIBLE_BOOKS.map((b) => b.toLowerCase()).indexOf(query) + 1];

    const nextBookIndex = match(nextBook)
      .with(
        P.when((nextBook) => nextBook !== undefined),
        () => lowerCaseBibleText.indexOf(nextBook!.toLowerCase())
      )
      .otherwise(() => -1);

    return await match(bookIndex)
      .with(
        P.when((bookIndex) => bookIndex < 0),
        () => Promise.reject(new Error(`Book ${query} not found`))
      )
      .with(
        P.when((bookIndex) => bookIndex >= 0 && nextBookIndex < 0),
        () => Promise.resolve(this.bibleText.slice(bookIndex) as T)
      )
      .otherwise(() =>
        Promise.resolve(this.bibleText.slice(bookIndex, nextBookIndex) as T)
      );
  }

  private searchByChapter(query: string): Promise<T> {
    throw new Error("Not implemented");
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
          BIBLE_BOOKS.map((b) => b.toLowerCase()).includes(query.toLowerCase())
        ),
        () => QueryTypeEnum.Book
      )
      .with(
        P.when((query) => query.match(/^\S+\s+\d+\:\d+$/)),
        () => QueryTypeEnum.Verse
      )
      .with(
        P.when((query) => query.match(/^\S+\s+\d+$/)),
        () => QueryTypeEnum.Chapter
      )
      .otherwise(() => QueryTypeEnum.Word);
  }
}
