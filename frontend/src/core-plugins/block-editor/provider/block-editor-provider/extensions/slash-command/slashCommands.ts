import {
  Extension,
  ReactRenderer,
  Suggestion,
  type SuggestionOptions,
} from "@system/lib/tiptap";
import tippy, { type Instance } from "tippy.js";
import SlashCommandsList from "./SlashCommandsList";
import { commands } from "./commands";

interface SlashSuggestionOptions {
  suggestion?: Partial<SuggestionOptions>;
  options?: unknown;
}

//TODO: add key event (key down, key up)
export const SlashCommand = Extension.create<SlashSuggestionOptions>({
  name: "slashCommands",

  addOptions: () => {
    return {
      suggestion: {
        char: "/",

        items: ({ query }: { query: string }) => {
          return commands.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase()),
          );
        },

        command: ({ editor, range, props: selectedItem }) => {
          selectedItem.command({ editor, range });
        },

        render: () => {
          let reactRenderer: ReactRenderer;
          let popup: Instance[];

          return {
            onStart: (props) => {
              reactRenderer = new ReactRenderer(SlashCommandsList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect: () => {
                  const rect = props.clientRect?.();
                  if (rect) {
                    return rect;
                  }
                  return new DOMRect(0, 0, 0, 0);
                },
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props) {
              reactRenderer.updateProps(props);

              popup?.[0]?.setProps({
                getReferenceClientRect: () => {
                  const rect = props.clientRect?.();
                  if (rect) {
                    return rect;
                  }
                  return new DOMRect(0, 0, 0, 0);
                },
              });
            },

            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();

                return true;
              }

              // return reactRenderer.ref?.onKeyDown(props);
              return false;
            },

            onExit() {
              popup?.[0]?.destroy();
              reactRenderer?.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
