import { Dimensions } from "@/types/base.types";

export const createIframe = (
  html: string,
  dimension: Dimensions,
): Promise<HTMLIFrameElement> => {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    (iframe.style.width = `${dimension.width}px`),
      (iframe.style.height = `${dimension.height}px`);
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.zIndex = "-1";
    iframe.setAttribute("aria-hidden", "true");

    const handleLoad = () => {
      iframe.removeEventListener("load", handleLoad);

      const doc = iframe.contentDocument;
      if (!doc) {
        reject(new Error("Failed to access iframe document"));
        return;
      }

      const checkReady = () => {
        if (doc.readyState === "complete") {
          requestAnimationFrame(() => resolve(iframe));
        } else {
          setTimeout(checkReady, 10);
        }
      };

      checkReady();
    };

    iframe.addEventListener("load", handleLoad);
    iframe.onerror = () => reject(new Error("Failed to load iframe"));
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
};

export const destroyIframe = (iframe: HTMLIFrameElement): void => {
  iframe.remove();
};
