#!/usr/bin/env node
import { readFile } from "fs/promises";
import { resolve } from "path";
import { HtmlToPptx } from "./index";
import { ANSI } from "./constants";

function log(text: string): {
  error: () => void;
  info: () => void;
  success: () => void;
} {
  const tag = `${ANSI.dim}[html-in-pptx-out]${ANSI.reset}`;
  return {
    error: () => {
      console.error(`${tag} ${ANSI.red}Error:${ANSI.reset}\n${text}`);
    },
    info: () => {
      console.log(`${tag} ${text}`);
    },
    success: () => {
      console.log(`${tag} ${ANSI.green}${text}${ANSI.reset}`);
    },
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const positional: string[] = [];
  let selector = ".slide";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--selector" && i + 1 < args.length) {
      selector = args[i + 1];
      i++;
    } else if (!args[i].startsWith("--")) {
      positional.push(args[i]);
    }
  }

  if (positional.length < 2) {
    log(
      "Usage: html-in-pptx-out <input.html> <output.pptx> [--selector <selector>]",
    ).error();
    process.exit(1);
  }

  const [inputPath, outputPath] = positional;
  const inputResolved = resolve(inputPath);
  const outputResolved = resolve(outputPath);

  const html = await readFile(inputResolved, "utf-8");

  const converter = new HtmlToPptx({
    selector: selector,
  });

  await converter.load(html).convert();

  await converter.export({
    format: "pptx",
    filename: outputResolved,
  });

  log(`exported: ${outputResolved}`).success();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
