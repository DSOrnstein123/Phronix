import { mergeAttributes, ReactNodeViewRenderer } from "@system/lib/tiptap";
import { View } from "./View.tsx";
import { FloatBlock } from "../float-block/FloatBlock.ts";

export const Callout = FloatBlock.extend({
  name: "callout",
  content: "inline*",
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "callout" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(View);
  },
});
