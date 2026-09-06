import { Extension, callOrReturn } from "@tiptap/core";

export const FloatBlockAttributes = Extension.create({
  name: "float-block-attributes",

  addGlobalAttributes() {
    const floatBlockTypes = this.extensions
      .filter((extension) => {
        if (extension.type !== "node") return false;

        const group = callOrReturn(extension.config.group, {
          name: extension.name,
          options: extension.options,
          storage: extension.storage,
        });

        return (
          typeof group === "string" && group.split(" ").includes("floatBlock")
        );
      })
      .map((extension) => extension.name);

    if (floatBlockTypes.length === 0) return [];

    return [
      {
        types: floatBlockTypes,
        attributes: {
          align: { default: "center" },
          width: { default: 100 },
        },
      },
    ];
  },
});
