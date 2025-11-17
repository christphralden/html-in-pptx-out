import { FA5_TO_FA6_NAMES } from "@/constants";

export interface IconSVGData {
  viewBox: string;
  path: string;
}

const iconStore = new Map<string, IconSVGData>();
const iconFetchPromiseStore = new Map<string, Promise<IconSVGData | null>>();

export const detectIconVariant = (classList: string[]): string => {
  if (classList.includes("fab") || classList.includes("fa-brands"))
    return "brands";
  if (classList.includes("far") || classList.includes("fa-regular"))
    return "regular";
  return "solid";
};

export const extractIconClass = (classList: string[]): string | null => {
  return (
    classList.find((cls) => cls.startsWith("fa-") && cls !== "fa") || null
  );
};

const fetchIconFromCDNInternal = async (
  iconClass: string,
  variant: string,
): Promise<IconSVGData | null> => {
  const iconName = iconClass.replace("fa-", "");
  const fa6Name = FA5_TO_FA6_NAMES[iconName] || iconName;
  const iconNames = fa6Name !== iconName ? [fa6Name, iconName] : [iconName];
  const variants = variant === "solid" ? ["solid"] : [variant, "solid"];

  for (const name of iconNames) {
    for (const v of variants) {
      const urls = [
        `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/svgs/${v}/${name}.svg`,
        `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.0.0/svgs/${v}/${name}.svg`,
      ];

      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;

          const svgText = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgText, "image/svg+xml");
          const svg = doc.querySelector("svg");

          if (!svg) continue;

          const viewBox = svg.getAttribute("viewBox") || "0 0 512 512";
          const paths = Array.from(svg.querySelectorAll("path"))
            .map((p) => p.getAttribute("d"))
            .filter(Boolean)
            .join(" ");

          if (!paths) continue;

          return { viewBox, path: paths };
        } catch {
          continue;
        }
      }
    }
  }

  return null;
};

export const fetchIconFromCDN = async (
  iconClass: string,
  variant: string,
): Promise<IconSVGData | null> => {
  const cacheKey = `${variant}:${iconClass}`;

  if (iconStore.has(cacheKey)) {
    return iconStore.get(cacheKey)!;
  }

  if (iconFetchPromiseStore.has(cacheKey)) {
    return iconFetchPromiseStore.get(cacheKey)!;
  }

  const fetchPromise = fetchIconFromCDNInternal(iconClass, variant)
    .then((result) => {
      if (result) {
        iconStore.set(cacheKey, result);
      }
      return result;
    })
    .finally(() => {
      iconFetchPromiseStore.delete(cacheKey);
    });

  iconFetchPromiseStore.set(cacheKey, fetchPromise);
  return fetchPromise;
};

export const createIconSVGDataURI = (
  svgData: IconSVGData,
  color: string,
): string => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgData.viewBox}"><path fill="#${color}" d="${svgData.path}"/></svg>`;
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
};
