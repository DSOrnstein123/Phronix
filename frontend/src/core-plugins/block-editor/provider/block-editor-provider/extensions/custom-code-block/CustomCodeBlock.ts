import { CodeBlockLowlight } from "@system/lib/tiptap";
import { View } from "./View";
import { floatBlockConfig } from "../float-block/floatBlockConfig";
import { ReactFloatBlockViewRenderer } from "../float-block/ReactFloatBlockViewRenderer";

export const CustomCodeBlock = CodeBlockLowlight.extend({
  ...floatBlockConfig,

  addNodeView() {
    return ReactFloatBlockViewRenderer(View);
  },
});
