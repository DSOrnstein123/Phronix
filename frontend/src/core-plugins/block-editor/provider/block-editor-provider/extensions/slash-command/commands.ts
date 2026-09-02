import {
  CircleSmall,
  CodeXml,
  Heading1,
  Heading2,
  Heading3,
  Image,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react";
import { type Editor, type Range } from "@system/lib/tiptap";

interface CommandItemProps {
  name: string;
  icon: LucideIcon;
  syntax?: string;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

const commands: CommandItemProps[] = [
  // {
  //   name: "Collection",
  //   icon: Database,
  //   command: async ({ editor, range }) => {
  //     const collection = await collectionService.create();
  //     queryClient.setQueryData<Collection>(
  //       collectionKeys.detail(collection.id),
  //       (oldData) => oldData ?? collection,
  //     );

  //     editor
  //       .chain()
  //       .deleteRange(range)
  //       .insertContent({
  //         type: "collection-node",
  //         attrs: {
  //           collectionId: collection.id,
  //         },
  //       })
  //       .run();
  //   },
  // },
  {
    name: "Bullet list",
    icon: CircleSmall,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    name: "Image",
    icon: Image,
    command: ({ editor, range }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "content-block",
        })
        .run();
    },
  },
  {
    name: "Callout",
    icon: RectangleHorizontal,
    command: ({ editor, range }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "callout",
        })
        .run();
    },
  },
  {
    name: "Column",
    icon: RectangleHorizontal,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "column-container",
          content: [
            {
              type: "column",
              content: [{ type: "paragraph" }],
            },
            {
              type: "column",
              content: [{ type: "paragraph" }],
            },
          ],
        })
        .run();
    },
  },
  {
    name: "Code Block",
    icon: CodeXml,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
];

export { commands, type CommandItemProps };
