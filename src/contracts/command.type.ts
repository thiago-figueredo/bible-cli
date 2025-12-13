export interface Command<T> {
  run(args: string[]): Promise<T>;
}
