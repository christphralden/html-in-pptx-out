import type { TextRun } from "@/types/elements.types";
import { extractTypography } from "./typography";
import { classifyText } from "./classifier";

export const extractRuns = (node: Node): TextRun[] => {
  const runs: TextRun[] = [];

  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.replace(/\s+/g, " ") || "";
      if (text.trim().length > 0) {
        runs.push({ content: text });
      }
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (tagName === "br") {
        runs.push({ content: "\n" });
        continue;
      }

      const className = el.className || "";
      const doc = el.ownerDocument;
      const style = doc.defaultView!.getComputedStyle(el);

      const childRuns = extractRuns(el);
      const textType = classifyText(tagName);
      if (!textType) continue;

      const run: TextRun = {
        content: el.textContent || "",
        tagName: tagName,
        className: className,
        typography: extractTypography(style),
        children: childRuns.length > 0 ? childRuns : undefined,
      };

      if (tagName === "a") {
        run.href = el.getAttribute("href") || undefined;
      }

      runs.push(run);
    }
  }

  return runs;
};

export const extractTextContent = (node: Node): string => {
  let text = "";

  const processNode = (n: Node): void => {
    if (n.nodeType === Node.TEXT_NODE) {
      text += n.textContent || "";
      return;
    }

    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (tagName === "br") {
        text += "\n";
        return;
      }

      for (const child of n.childNodes) {
        processNode(child);
      }

      if (tagName === "p" || tagName === "div") {
        if (n.nextSibling) {
          text += "\n";
        }
      }
    }
  };

  for (const child of node.childNodes) {
    processNode(child);
  }

  return text.trim();
};
