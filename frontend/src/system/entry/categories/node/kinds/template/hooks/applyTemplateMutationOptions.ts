import { mutationOptions } from "@tanstack/react-query";
import { systemApi } from "@system/api";
import type { NodeType } from "@system/plugin-manager/plugin";
import { queryClient } from "@system/config/queryClient";
import { nodeKeys } from "../../../keys";
import type { ApplyTemplatePayload } from "../types/applyTemplatePayload";

export const applyTemplateMutationOptions = <N extends NodeType>() =>
  mutationOptions({
    mutationKey: ["node", "template", "apply"],
    mutationFn: (payload: ApplyTemplatePayload) => {
      return systemApi.node.template.applyTemplate<N>(payload);
    },

    onSuccess: (updatedNode) => {
      queryClient.setQueryData(nodeKeys.detail(updatedNode.id), updatedNode);

      //TODO: add setQuery to list
    },

    onError: (error) => {
      console.log(error);
    },
  });
