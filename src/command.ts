import path from "path";
import { CommandType } from "./enums/command-type.enum";
import { SearchBibleCommand } from "./search-bible-command";

export class Command {
  private static readonly BIBLE_TEXT_PATH = path.join(
    process.cwd(),
    "data",
    "en",
    "bible.txt"
  );

  static async run(argv: string[]): Promise<string> {
    const [command] = argv;
    const bibleText = await Bun.file(this.BIBLE_TEXT_PATH).text();

    if (!bibleText) {
      throw new Error("Bible text not found");
    }

    const strategies = {
      [CommandType.Search]: async () =>
        await new SearchBibleCommand(bibleText).run(argv.slice(1)),
    };

    if (!command) {
      throw new Error("Please provide a command");
    }

    const commandType = CommandType.from(command.toLowerCase());

    if (!commandType || !(commandType in strategies)) {
      throw new Error("Please provide a valid command");
    }

    return await strategies[commandType]();
  }
}
