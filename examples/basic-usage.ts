import { HtmlToPptx } from "../src/index";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

async function main() {
  const htmlPath = resolve(__dirname, "semiconductor-thesis.html");
  const html = await readFile(htmlPath, "utf-8");

  const converter = new HtmlToPptx({
    selector: ".slide",
  });

  await converter.load(html).convert();

  const buffer = await converter.export({
    format: "pptx",
    filename: "semiconductor-thesis.pptx",
  });

  await writeFile("semiconductor-thesis.pptx", Buffer.from(buffer));

  console.log("Presentation created successfully!");
}

main().catch(console.error);
