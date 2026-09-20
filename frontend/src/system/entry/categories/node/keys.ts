import type { NodeListOptions } from "./core/types/payload";

export const nodeKeys = {
  all: ["nodes"] as const,
  lists: () => [...nodeKeys.all, "list"],
  list: (filter?: NodeListOptions) => [...nodeKeys.lists(), filter],
  detail: (id: string) => [...nodeKeys.all, "detail", id],

  links: () => [...nodeKeys.all, "links"],
  forwardLinks: (sourceNodeId: string) => [
    ...nodeKeys.links(),
    "forward",
    sourceNodeId,
  ],
  backlinks: (targetNodeId: string) => [
    ...nodeKeys.links(),
    "backward",
    targetNodeId,
  ],
};
