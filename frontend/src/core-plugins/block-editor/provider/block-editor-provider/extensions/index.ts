import { StarterKit, Placeholder } from "@system/lib/tiptap";
import CustomLink from "./custom-link/customLink";
import { SlashCommand } from "./slash-command/slashCommands";
import { FloatDragExtension } from "./float-block/dnd/floatDragExtension";
import { Column } from "./column/column";
import { ColumnContainer } from "./column/columnContainer";
import { CustomCodeBlock } from "./custom-code-block/CustomCodeBlock";
import { createLowlight, all } from "lowlight";
import { extensionRegistry } from "../extensionRegistry";
import { SemanticHighlight } from "./semantic-highlight/semanticHighlight";
import { Focus } from "@tiptap/extensions";
import { FloatBlockAttributes } from "./float-block/FloatingBlockAttributes";
import { Callout } from "./callout/Callout";

const lowlight = createLowlight(all);

export const richTextEditorExtensions = [
  StarterKit.configure({
    dropcursor: false,
    link: false,
    codeBlock: false,
  }),
  CustomLink.configure({
    openOnClick: false,
  }),
  SlashCommand,
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: true,

    placeholder: ({ node }) => {
      if (node.type.name === "paragraph") {
        return "Press '/' for commands";
      }

      return "";
    },
  }),
  Focus.configure({
    className: "focus",
    mode: "deepest",
  }),
  Callout,
  Column,
  ColumnContainer,
  CustomCodeBlock.configure({
    lowlight,
    enableTabIndentation: true,
    tabSize: 2,
  }),
  SemanticHighlight,
  FloatDragExtension,
  FloatBlockAttributes,
  ...extensionRegistry.getAllExtensions(),
];
