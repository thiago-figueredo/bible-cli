import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Command } from "./src/command";

async function createFileIfNotExists(filepath: string, content: string) {
  await mkdir(path.dirname(filepath), { recursive: true });
  await writeFile(filepath, content, "utf8");
}

async function getBibleText(): Promise<string> {
  const bibleTxtUrl =
    "https://raw.githubusercontent.com/mxw/grmr/master/src/finaltests/bible.txt";

  const response = await fetch(bibleTxtUrl);

  return await response.text();
}

export async function downloadBibleTxt(filePath: string): Promise<string> {
  const bibleTxt = await getBibleText();

  await createFileIfNotExists(filePath, bibleTxt);

  const genesisBookStart = "The First Book of Moses:  Called Genesis\n";

  return bibleTxt.startsWith(genesisBookStart)
    ? bibleTxt
    : genesisBookStart + bibleTxt;
}

export async function start(filePath: string, content: string) {
  await createFileIfNotExists(filePath, content);
}

const filePath = path.join(process.cwd(), "data", "en", "bible.txt");
const bibleTxt = await downloadBibleTxt(filePath);

await start(filePath, bibleTxt);

if (process.env.NODE_ENV !== "test") {
  const result = await Command.run([...Bun.argv.slice(2), bibleTxt]);
  console.log(result);
}
