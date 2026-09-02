import { StarterKit, Placeholder } from "@system/lib/tiptap";
import CustomLink from "./custom-link/customLink";
import SlashCommandExtension from "./slash-command/slashCommands";
import { Callout } from "./callout/contentBlock";
import { FloatDragExtension } from "./float-block/dnd/floatDragExtension";
import { Column } from "./column/column";
import { ColumnContainer } from "./column/columnContainer";
import { CustomCodeBlock } from "./custom-code-block/CustomCodeBlock";
import { createLowlight, all } from "lowlight";
import { extensionRegistry } from "../extensionRegistry";
import { SemanticHighlight } from "./semantic-highlight/semanticHighlight";

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
  SlashCommandExtension,
  Placeholder.configure({
    showOnlyCurrent: true,
    placeholder: () => {
      return "Press '/' for commands";
    },
  }),
  FloatDragExtension,
  Callout,
  Column,
  ColumnContainer,
  CustomCodeBlock.configure({
    lowlight,
    enableTabIndentation: true,
    tabSize: 2,
  }),
  SemanticHighlight,
  ...extensionRegistry.getAllExtensions(),
];
