import { type NodeConfig, callOrReturn } from "@tiptap/react";

export const floatBlockConfig: Partial<NodeConfig> = {
  draggable: true,
  group() {
    const parentGroup = callOrReturn(this.parent, this) ?? "block";
    const groups = parentGroup.split(" ");

    if (!groups.includes("floatBlock")) {
      groups.push("floatBlock");
    }

    return groups.join(" ");
  },
};
