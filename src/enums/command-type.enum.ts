enum CommandTypeEnum {
  Search = "Search",
}

export class CommandType {
  static Search = CommandTypeEnum.Search;

  static from(command: string): CommandTypeEnum {
    command = command.charAt(0).toUpperCase() + command.slice(1).toLowerCase();

    if (!Object.values(CommandTypeEnum).includes(command as CommandTypeEnum)) {
      throw new Error("Invalid command");
    }

    return CommandTypeEnum[command as keyof typeof CommandTypeEnum];
  }
}
