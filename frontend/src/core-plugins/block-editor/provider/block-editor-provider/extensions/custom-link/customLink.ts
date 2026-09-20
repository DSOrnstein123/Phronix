import { Link } from "@system/lib/tiptap";

const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      "data-node-id": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-node-id"),
        renderHTML: (attributes) => {
          if (!attributes["data-node-id"]) return {};
          return { "data-node-id": attributes["data-node-id"] };
        },
      },
    };
  },
});

export default CustomLink;
