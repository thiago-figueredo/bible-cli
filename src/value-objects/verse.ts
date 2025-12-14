export class Verse {
  private constructor(public readonly value: number) {}

  static make(value?: string): Verse {
    if (!value) {
      throw new Error("Verse number is required");
    }

    if (!Number.isInteger(Number(value))) {
      throw new Error("Verse must be a integer number");
    }

    return new Verse(Number(value));
  }
}
