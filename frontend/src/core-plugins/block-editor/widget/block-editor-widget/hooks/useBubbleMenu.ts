import type { BubbleMenuAction } from "../types";
import {
  Bold,
  Code2,
  Highlighter,
  Italic,
  Link2,
  Strikethrough,
} from "lucide-react";
import { nanoid } from "nanoid";
import { Editor, useEditorState } from "@system/lib/tiptap";
import { useState } from "react";

const useBubbleMenu = (editor: Editor) => {
  const [showLinkSuggestion, setShowLinkSuggestion] = useState(false);

  const { isBold, isItalic, isStrike, isCode, isLink, isHighlight } =
    useEditorState({
      editor,
      selector: ({ editor }) => ({
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        isCode: editor.isActive("code"),
        isLink: editor.isActive("link"),
        isHighlight: editor.isActive("highlight") ?? false,
      }),
    });

  const handleSelect = (targetNodeId: string) => {
    editor
      .chain()
      .focus()
      .setMark("link", {
        href: `/node/${targetNodeId}`,
        "data-node-id": targetNodeId,
      })
      .run();

    setShowLinkSuggestion(false);
  };

  const actions: BubbleMenuAction[] = [
    {
      id: "bold",
      label: "Bold",
      icon: Bold,
      highlighted: isBold,
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      id: "italic",
      label: "Italic",
      icon: Italic,
      highlighted: isItalic,
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      id: "strike",
      label: "Strikethrough",
      icon: Strikethrough,
      highlighted: isStrike,
      action: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      id: "code",
      label: "Inline code",
      icon: Code2,
      highlighted: isCode,
      action: () => editor.chain().focus().toggleCode().run(),
    },
    {
      id: "link",
      label: "Link",
      icon: Link2,
      highlighted: isLink || showLinkSuggestion,
      action: () => setShowLinkSuggestion((current) => !current),
      separated: true,
    },
    {
      id: "highlight",
      label: "Highlight",
      icon: Highlighter,
      highlighted: isHighlight,
      action: () => {
        if (isHighlight) {
          editor.chain().focus().unsetHighlight().run();
          return;
        }

        editor
          .chain()
          .focus()
          .setMark("highlight", {
            id: nanoid(),
          })
          .run();
      },
    },
  ];

  return { actions, showLinkSuggestion, handleSelect };
};

export default useBubbleMenu;
