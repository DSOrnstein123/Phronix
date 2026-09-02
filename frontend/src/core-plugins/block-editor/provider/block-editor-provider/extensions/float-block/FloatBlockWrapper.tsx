import { NodeViewWrapper } from "@tiptap/react";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

export const FloatBlockWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <NodeViewWrapper
      data-float-block
      className={`group relative w-full rounded-sm p-4 transition-all ${className}`}
    >
      <div
        contentEditable={false}
        data-drag-handle
        className="absolute top-2 -left-6 cursor-grab rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {children}
    </NodeViewWrapper>
  );
};
