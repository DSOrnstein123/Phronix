import { ReactNodeViewRenderer } from "@tiptap/react";

export const ReactFloatBlockViewRenderer = (
  ...[component, options]: Parameters<typeof ReactNodeViewRenderer>
) => {
  return ReactNodeViewRenderer(component, {
    ...options,
    className: `${options?.className} float-block`,
  });
};
