import {
  Extension,
  NodeSelection,
  Plugin,
  PluginKey,
  type EditorView,
} from "@system/lib/tiptap";

const getDragIndicator = () => {
  let el = document.getElementById("tiptap-drag-indicator");
  if (!el) {
    el = document.createElement("div");
    el.id = "tiptap-drag-indicator";
    el.style.cssText =
      "position:fixed;pointer-events:none;z-index:99999;background:#3b82f6;border-radius:2px;opacity:0;transition:opacity 0.15s ease";
    document.body.appendChild(el);
  }
  return el;
};

const getIndicatorY = (
  blockDOM: HTMLElement,
  rect: DOMRect,
  above: boolean,
  GAP: number,
  LINE: number,
) => {
  const sibling = (
    above ? blockDOM.previousElementSibling : blockDOM.nextElementSibling
  ) as HTMLElement | null;

  if (sibling) {
    const siblingRect = sibling.getBoundingClientRect();
    const gapTop = above ? siblingRect.bottom : rect.bottom;
    const gapBottom = above ? rect.top : siblingRect.top;

    if (gapBottom > gapTop) {
      return (gapTop + gapBottom) / 2 - LINE / 2;
    }
  }

  return above ? rect.top - GAP - LINE : rect.bottom + GAP;
};

const hideDragIndicator = () => {
  const el = document.getElementById("tiptap-drag-indicator");
  if (el) el.style.opacity = "0";
};

export const syncAlignAttrs = (view: EditorView) => {
  (view.dom as HTMLElement)
    .querySelectorAll<HTMLElement>(".react-renderer.float-block")
    .forEach((wrapper) => {
      let raw: number;
      try {
        raw = view.posAtDOM(wrapper, 0);
      } catch {
        return;
      }
      if (raw < 0) return;

      const $pos = view.state.doc.resolve(raw);
      const node = $pos.node($pos.depth);

      if (!node || !node.type.isInGroup("floatBlock")) return;

      const align: string = node.attrs.align ?? "center";
      if (wrapper.dataset.align !== align) wrapper.dataset.align = align;
    });
};

const findBlockDOM = (
  element: HTMLElement,
  editorDOM: HTMLElement,
): HTMLElement | null => {
  let el: HTMLElement | null = element;
  while (el && el !== editorDOM) {
    const parent: HTMLElement | null = el.parentElement;
    if (!parent) break;
    if (parent === editorDOM) return el;
    if (parent.getAttribute("data-type") === "column") return el;
    if (
      parent.classList.contains("react-renderer") &&
      (parent.parentElement === editorDOM ||
        parent.parentElement?.getAttribute("data-type") === "column")
    )
      return parent;
    el = parent;
  }
  return null;
};

const getBlockDOMAtCoords = (
  view: EditorView,
  x: number,
  y: number,
  skip: HTMLElement | null,
): HTMLElement | null => {
  const editorDOM = view.dom as HTMLElement;

  const coord = view.posAtCoords({ left: x, top: y });
  if (coord) {
    const $pos = view.state.doc.resolve(coord.pos);
    for (let d = $pos.depth; d >= 1; d--) {
      const pName = $pos.node(d - 1).type.name;
      if (pName === "doc" || pName === "column") {
        const nodeName = $pos.node(d).type.name;
        if (nodeName === "column" || nodeName === "column-container") break;
        let dom = view.nodeDOM($pos.before(d)) as HTMLElement | null;
        if (!dom) break;
        while (
          dom.parentElement !== editorDOM &&
          dom.parentElement?.getAttribute("data-type") !== "column"
        ) {
          if (!dom.parentElement) break;
          dom = dom.parentElement;
        }

        if (dom.classList.contains("float-block")) {
          const rect = dom.getBoundingClientRect();
          if (y > rect.bottom) {
            dom = null;
          }
        }

        if (!dom) break;
        if (skip && (dom === skip || skip.contains(dom))) break;
        return dom;
      }
    }
  }

  for (const el of document.elementsFromPoint(x, y) as HTMLElement[]) {
    if (skip && (el === skip || skip.contains(el))) continue;
    const block = findBlockDOM(el, editorDOM);
    if (block) {
      if (block.classList.contains("float-block")) {
        const rect = block.getBoundingClientRect();
        if (y > rect.bottom) continue;
      }
      return block;
    }
  }
  return null;
};

const blockPosFromDOM = (
  view: EditorView,
  blockDOM: HTMLElement,
): number | null => {
  let raw: number;
  try {
    raw = view.posAtDOM(blockDOM, 0);
  } catch {
    return null;
  }
  if (raw < 0) return null;
  const $pos = view.state.doc.resolve(raw);
  for (let d = $pos.depth; d >= 1; d--) {
    const pName = $pos.node(d - 1).type.name;
    if (pName === "doc" || pName === "column") return $pos.before(d);
  }
  return $pos.before(1);
};

const updateIndicator = (
  _: EditorView,
  blockDOM: HTMLElement,
  x: number,
  y: number,
) => {
  const rect = blockDOM.getBoundingClientRect();
  const relX = x - rect.left;
  const midY = rect.top + rect.height / 2;
  const ind = getDragIndicator();
  const GAP = 6,
    LINE = 4;

  const isContainerOrColumn =
    blockDOM.classList.contains("node-column-container") ||
    blockDOM.getAttribute("data-type") === "column" ||
    (blockDOM.classList.contains("react-renderer") &&
      blockDOM.firstElementChild?.classList.contains(
        "column-container-wrapper",
      ));

  const targetIsFloatBlock = blockDOM.classList.contains("float-block");

  if (isContainerOrColumn) {
    Object.assign(ind.style, {
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${LINE}px`,
      opacity: "1",
      top: `${
        y < midY
          ? getIndicatorY(blockDOM, rect, true, GAP, LINE)
          : getIndicatorY(blockDOM, rect, false, GAP, LINE)
      }px`,
    });
  } else {
    const ZONE = Math.min(rect.width * 0.25, 80);

    if (targetIsFloatBlock && relX < ZONE) {
      Object.assign(ind.style, {
        left: `${rect.left - GAP - LINE}px`,
        top: `${rect.top}px`,
        width: `${LINE}px`,
        height: `${rect.height}px`,
        opacity: "1",
      });
    } else if (targetIsFloatBlock && relX > rect.width - ZONE) {
      Object.assign(ind.style, {
        left: `${rect.right + GAP}px`,
        top: `${rect.top}px`,
        width: `${LINE}px`,
        height: `${rect.height}px`,
        opacity: "1",
      });
    } else {
      Object.assign(ind.style, {
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${LINE}px`,
        opacity: "1",
        top: `${
          y < midY
            ? getIndicatorY(blockDOM, rect, true, GAP, LINE)
            : getIndicatorY(blockDOM, rect, false, GAP, LINE)
        }px`,
      });
    }
  }
};

export const FloatDragExtension = Extension.create({
  name: "floatDrag",

  addProseMirrorPlugins() {
    let dragSource: {
      pos: number;
      size: number;
      dom: HTMLElement | null;
    } | null = null;

    return [
      new Plugin({
        key: new PluginKey("floatDrag"),

        view(editorView) {
          const editorDOM = editorView.dom;

          const onDragOver = (event: DragEvent) => {
            event.preventDefault();
            const skip =
              dragSource?.dom && document.contains(dragSource.dom)
                ? dragSource.dom
                : null;
            const blockDOM = getBlockDOMAtCoords(
              editorView,
              event.clientX,
              event.clientY,
              skip,
            );
            if (!blockDOM) {
              hideDragIndicator();
              return;
            }
            updateIndicator(editorView, blockDOM, event.clientX, event.clientY);
          };

          const onDragLeave = (event: DragEvent) => {
            if (!editorDOM.contains(event.relatedTarget as Node))
              hideDragIndicator();
          };

          editorDOM.addEventListener("dragover", onDragOver);
          editorDOM.addEventListener("dragleave", onDragLeave);

          return {
            update() {
              syncAlignAttrs(editorView);
            },
            destroy() {
              editorDOM.removeEventListener("dragover", onDragOver);
              editorDOM.removeEventListener("dragleave", onDragLeave);
            },
          };
        },

        props: {
          handleDOMEvents: {
            dragstart(view, event) {
              const target = event.target as HTMLElement | null;

              if (target) {
                const wrapper = target.closest<HTMLElement>(
                  ".react-renderer.float-block",
                );

                if (wrapper && view.dom.contains(wrapper)) {
                  let raw: number;
                  try {
                    raw = view.posAtDOM(wrapper, 0);
                  } catch {
                    raw = -1;
                  }

                  if (raw >= 0) {
                    const $pos = view.state.doc.resolve(raw);
                    const node = $pos.node($pos.depth);

                    if (node && node.type.isInGroup("floatBlock")) {
                      const blockPos = $pos.before($pos.depth);
                      dragSource = {
                        pos: blockPos,
                        size: node.nodeSize,
                        dom: wrapper,
                      };
                      return false;
                    }
                  }
                }
              }

              const { selection } = view.state;
              if (selection instanceof NodeSelection) {
                dragSource = {
                  pos: selection.from,
                  size: selection.node.nodeSize,
                  dom: view.nodeDOM(selection.from) as HTMLElement | null,
                };
              }
              return false;
            },

            drop(view, event) {
              hideDragIndicator();
              if (!dragSource) return false;

              const { state, dispatch } = view;
              const skip =
                dragSource.dom && document.contains(dragSource.dom)
                  ? dragSource.dom
                  : null;
              const blockDOM = getBlockDOMAtCoords(
                view,
                event.clientX,
                event.clientY,
                skip,
              );
              if (!blockDOM) return false;

              const slice = view.dragging?.slice;
              const draggedNode = slice?.content.firstChild;
              if (!draggedNode?.type.isInGroup("floatBlock")) {
                return false;
              }

              const rect = blockDOM.getBoundingClientRect();
              const relX = event.clientX - rect.left;
              const midY = rect.top + rect.height / 2;

              const isColumn = blockDOM.getAttribute("data-type") === "column";
              const isContainer =
                blockDOM.classList.contains("node-column-container") ||
                (blockDOM.classList.contains("react-renderer") &&
                  blockDOM.firstElementChild?.classList.contains(
                    "column-container-wrapper",
                  ));

              const targetBlockPos = blockPosFromDOM(view, blockDOM);
              if (targetBlockPos === null) return false;

              const targetIsFloatBlock =
                blockDOM.classList.contains("float-block");

              const ZONE = Math.min(rect.width * 0.25, 80);
              let align = "center";
              let isSideDrop = false;

              if (!isColumn && !isContainer && targetIsFloatBlock) {
                if (relX < ZONE) {
                  align = "left";
                  isSideDrop = true;
                } else if (relX > rect.width - ZONE) {
                  align = "right";
                  isSideDrop = true;
                } else {
                  const targetNode = state.doc.nodeAt(targetBlockPos);
                  align = (targetNode?.attrs.align as string) ?? "center";
                  isSideDrop = false;
                }
              }

              event.preventDefault();

              let targetPos: number;
              if (isColumn) {
                const $i = state.doc.resolve(targetBlockPos + 1);
                let d = $i.depth;
                while (d > 0 && $i.node(d).type.name !== "column") d--;
                targetPos = event.clientY < midY ? $i.start(d) : $i.end(d);
              } else if (isContainer) {
                const $i = state.doc.resolve(targetBlockPos + 1);
                let d = $i.depth;
                while (d > 0 && $i.node(d).type.name !== "column-container")
                  d--;
                targetPos = event.clientY < midY ? $i.before(d) : $i.after(d);
              } else if (isSideDrop) {
                targetPos = targetBlockPos;
              } else {
                const targetNode = state.doc.nodeAt(targetBlockPos);
                targetPos =
                  event.clientY < midY
                    ? targetBlockPos
                    : targetBlockPos + (targetNode?.nodeSize ?? 1);
              }

              const originalNode = state.doc.nodeAt(dragSource.pos);
              if (!originalNode) return false;

              const newNode = originalNode.type.create(
                { ...originalNode.attrs, align },
                originalNode.content,
                originalNode.marks,
              );

              const srcFrom = dragSource.pos;
              const srcTo = srcFrom + dragSource.size;
              const tr = state.tr;

              if (targetPos === srcFrom) {
                if (align !== originalNode.attrs.align) {
                  tr.setNodeMarkup(srcFrom, undefined, {
                    ...originalNode.attrs,
                    align,
                  });
                  dispatch(tr);
                }
                dragSource = null;
                return true;
              }

              if (targetPos > srcFrom && targetPos <= srcTo) targetPos = srcTo;

              if (targetPos > srcTo) {
                tr.insert(targetPos, newNode);
                tr.delete(srcFrom, srcTo);
              } else {
                tr.delete(srcFrom, srcTo);
                tr.insert(tr.mapping.map(targetPos), newNode);
              }

              dragSource = null;
              dispatch(tr);
              return true;
            },

            dragend() {
              hideDragIndicator();
              dragSource = null;
            },
          },
        },
      }),
    ];
  },
});
