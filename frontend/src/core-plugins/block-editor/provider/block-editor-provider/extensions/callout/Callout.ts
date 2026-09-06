import { mergeAttributes, Node, TextSelection } from "@system/lib/tiptap";
import { View } from "./View.tsx";
import { ReactFloatBlockViewRenderer } from "../float-block/ReactFloatBlockViewRenderer.ts";
import { floatBlockConfig } from "../float-block/floatBlockConfig.ts";

export const Callout = Node.create({
  name: "callout",
  content: "block+",
  ...floatBlockConfig,

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
    return ReactFloatBlockViewRenderer(View);
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        const parent = $from.parent;
        const isEmpty = parent.content.size === 0;

        if (!isEmpty) return false;

        let calloutDepth = -1;
        for (let d = $from.depth - 1; d >= 0; d--) {
          if ($from.node(d).type.name === "callout") {
            calloutDepth = d;
            break;
          }
        }

        if (calloutDepth === -1) return false;

        const callout = $from.node(calloutDepth);
        const isOnlyChild = callout.childCount === 1;

        const calloutEnd = $from.after(calloutDepth);
        const paragraphStart = $from.before($from.depth);
        const paragraphEnd = $from.after($from.depth);

        const chain = editor.chain();

        if (!isOnlyChild) {
          chain.deleteRange({ from: paragraphStart, to: paragraphEnd });
        }

        chain.command(({ tr, dispatch }) => {
          if (dispatch) {
            const newCalloutEnd = tr.mapping.map(calloutEnd);
            tr.insert(newCalloutEnd, state.schema.nodes.paragraph.create());
            tr.setSelection(
              TextSelection.near(tr.doc.resolve(newCalloutEnd + 1)),
            );
          }
          return true;
        });

        chain.run();

        return true;
      },
    };
  },
});
