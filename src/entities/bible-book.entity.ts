export class BibleBook {
  private constructor(
    public readonly name: string,
    public readonly author: string,
    public readonly description: string,
    public readonly firstChapter: number,
    public readonly lastChapter: number,
    public readonly fullName?: string
  ) {}

  static make({
    name,
    author,
    description,
    firstChapter,
    lastChapter,
    fullName,
  }: typeof BibleBook.prototype): BibleBook {
    return new BibleBook(
      name,
      author,
      description,
      firstChapter,
      lastChapter,
      fullName
    );
  }
}
