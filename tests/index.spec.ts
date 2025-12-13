import { faker } from "@faker-js/faker";
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import path from "path";
import { downloadBible, start } from "../index";

describe("start", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  const filePath = path.join(process.cwd(), "data", "en", "bible.txt");

  afterEach(async () => {
    if (await Bun.file(filePath).exists()) {
      await Bun.file(filePath).delete();
    }

    fetchSpy?.mockRestore();
  });

  it("should create the file if it doesn't exist", async () => {
    await start(filePath, faker.lorem.paragraphs(10));
    expect(await Bun.file(filePath).exists()).toBeTruthy();
  });

  it("should fetch the bible text via http request", async () => {
    const bibleTxt = faker.lorem.paragraphs(10);

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(bibleTxt, {
        status: 200,
        statusText: "OK",
        headers: new Headers(),
      })
    );

    const result = await downloadBible(filePath);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/mxw/grmr/master/src/finaltests/bible.txt"
    );

    expect(result).toContain(bibleTxt);
    expect(await Bun.file(filePath).exists()).toBeTruthy();
  });
});
