import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Command } from "./src/command";

async function createFileIfNotExists(filepath: string, content: string) {
  if (await Bun.file(filepath).exists()) {
    return;
  }

  await mkdir(path.dirname(filepath), { recursive: true });
  await writeFile(filepath, content, "utf8");
}

async function getBibleText(): Promise<string> {
  const bibleTxtUrl =
    "https://raw.githubusercontent.com/mxw/grmr/master/src/finaltests/bible.txt";

  const response = await fetch(bibleTxtUrl);

  return await response.text();
}

export async function downloadBible(filePath: string): Promise<string> {
  const bibleTxt = await getBibleText();
  const genesisBookStart = "The First Book of Moses:  Called Genesis\n";

  let fileContent = bibleTxt.startsWith(genesisBookStart)
    ? bibleTxt
    : genesisBookStart + bibleTxt;

  const endOfBibleTxt =
    "End of the Project Gutenberg EBook of The King James Bible";

  if (fileContent.includes(endOfBibleTxt)) {
    fileContent = fileContent.slice(0, fileContent.indexOf(endOfBibleTxt));
  }

  await createFileIfNotExists(filePath, fileContent);

  return fileContent;
}

export async function start(filePath: string, content: string) {
  if (process.env.NODE_ENV !== "test") {
    const result = await Command.run([...Bun.argv.slice(2), bibleTxt]);
    console.log(result);
  }
}

const filePath = path.join(process.cwd(), "data", "en", "bible.txt");
const bibleTxt = await downloadBible(filePath);

await start(filePath, bibleTxt);
