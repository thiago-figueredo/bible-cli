import type { Chapter } from "../value-objects/chapter";

export class BibleBook {
  public readonly fullName: string;

  private constructor(
    public readonly name: string,
    public readonly author: string,
    public readonly description: string,
    public readonly chapters: Chapter[],
    fullName: string | undefined = undefined
  ) {
    this.fullName = fullName || this.name;
  }

  static make({
    name,
    author,
    description,
    chapters,
    fullName,
  }: Omit<typeof BibleBook.prototype, "fullName"> & {
    fullName?: string;
  }): BibleBook {
    return new BibleBook(name, author, description, chapters, fullName);
  }
}
