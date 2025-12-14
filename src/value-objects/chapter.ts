export class Chapter {
  public readonly number: number;

  private constructor(
    number: string | number | undefined,
    public readonly numberOfVerses?: number
  ) {
    if (!number) {
      throw new Error("Chapter number is required");
    }

    if (!Number.isInteger(Number(number))) {
      throw new Error("Chapter must be a integer number");
    }

    this.number = Number(number);
  }

  static make({
    number,
    numberOfVerses,
  }: Omit<typeof Chapter.prototype, "number"> & {
    number: string | number;
  }): Chapter {
    return new Chapter(Number(number), numberOfVerses);
  }
}
