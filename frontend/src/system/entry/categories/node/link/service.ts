import { invoke } from "@tauri-apps/api/core";
import type { NodeMetadata } from "../core/schema";

export const nodeLinkService = {
  getForwardLinks: (sourceNodeId: string) => {
    return invoke<NodeMetadata[]>("get_forward_links", {
      sourceNodeId,
    });
  },

  createLinkWithMetadata: (sourceNodeId: string, targetNodeId: string) => {
    return invoke<NodeMetadata>("create_link_with_metadata", {
      sourceNodeId,
      targetNodeId,
    });
  },
};
