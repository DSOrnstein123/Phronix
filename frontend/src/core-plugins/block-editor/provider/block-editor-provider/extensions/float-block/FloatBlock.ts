import { Node } from "@system/lib/tiptap";

export const FloatBlock = Node.create({
  name: "float-block",
  group: "block floatBlock",
  draggable: true,

  addAttributes() {
    return {
      align: {
        default: "center",
      },
      width: {
        default: 100,
      },
    };
  },
});
