import { TextElementDTO } from "@/types/elements.types";
import { Plugin } from "@/types/plugin.types";

export const fontAwesomePlugin: Plugin<TextElementDTO> = {
  name: "core:font-awesome",
  handles: ["text"],
  onParse: (_element, _parseContext) => {
    return null;
  },
};
