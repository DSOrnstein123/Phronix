import {
  NodeViewWrapper,
  NodeViewContent,
  type ReactNodeViewProps,
} from "@system/lib/tiptap";
import { useRef, useState } from "react";

const ColumnContainerView = ({
  node,
  updateAttributes,
}: ReactNodeViewProps) => {
  const layout = (node.attrs.layout as [number, number]) || [50, 50];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();

    setIsResizing(true);
    const startX = e.pageX;
    const startLayout = [...layout];
    const containerWidth = container.offsetWidth || 1;

    const onMouseMove = (event: MouseEvent) => {
      const deltaX = event.pageX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;

      const snap = 10;
      const min = 20;
      const max = 80;

      const newLeft = Math.max(
        min,
        Math.min(
          max,
          Math.round((startLayout[0] + deltaPercent) / snap) * snap,
        ),
      );
      const newRight = 100 - newLeft;

      updateAttributes({ layout: [newLeft, newRight] });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className="group column-container-wrapper relative my-4 w-full"
      style={{
        "--col-left": `${layout[0]}fr`,
        "--col-right": `${layout[1]}fr`,
      }}
    >
      <NodeViewContent className="column-content-core" />

      <div
        contentEditable={false}
        onMouseDown={startResize}
        className={`absolute top-0 bottom-0 z-10 -ml-2 flex w-4 cursor-col-resize items-center justify-center transition-colors ${
          isResizing ? "bg-blue-400/20" : "bg-transparent hover:bg-gray-200/50"
        }`}
        style={{ left: `${layout[0]}%` }}
      >
        <div
          className={`h-8 w-1 rounded-full bg-gray-400 transition-opacity ${
            isResizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />
      </div>
    </NodeViewWrapper>
  );
};

export default ColumnContainerView;
