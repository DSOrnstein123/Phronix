import { NodeViewContent } from "@system/lib/tiptap";
import { FloatBlockWrapper } from "../float-block/FloatBlockWrapper";

export const View = () => {
  //TODO: allow user choose default color and change color at tooltip
  return (
    <FloatBlockWrapper className="bg-yellow-100">
      <NodeViewContent className="min-h-6 outline-none" />
    </FloatBlockWrapper>
  );
};
