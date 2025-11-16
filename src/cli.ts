#!/usr/bin/env node
import { readFile } from "fs/promises";
import { resolve } from "path";
import { HtmlToPptx } from "./index";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const positional: string[] = [];
  let slideSelector = ".slide";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--selector" && i + 1 < args.length) {
      slideSelector = args[i + 1];
      i++;
    } else if (!args[i].startsWith("--")) {
      positional.push(args[i]);
    }
  }

  if (positional.length < 2) {
    console.error(
      "Usage: html-in-pptx-out <input.html> <output.pptx> [--selector <selector>]"
    );
    process.exit(1);
  }

  const [inputPath, outputPath] = positional;
  const inputResolved = resolve(inputPath);
  const outputResolved = resolve(outputPath);

  const html = await readFile(inputResolved, "utf-8");

  const converter = new HtmlToPptx({
    slideSelector,
  });

  await converter.load(html).convert();

  await converter.export({
    format: "pptx",
    filename: outputResolved,
  });

  console.log(`exported: ${outputResolved}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
