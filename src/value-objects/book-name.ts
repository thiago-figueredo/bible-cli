export class BookName {
  private constructor(public readonly value: string) {}

  static make(value?: string): BookName {
    if (!value) {
      throw new Error("Book name is required");
    }

    return new BookName(value);
  }
}
