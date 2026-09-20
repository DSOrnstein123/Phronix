import { nodeKeys } from "@system/entry/categories/node/keys";
import { nodeService } from "@system/entry/categories/node/core/service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useImportNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      canvasId,
      nodeId,
    }: {
      canvasId: string;
      nodeId: string;
    }) => {
      return nodeService.patchData<"canvas">(canvasId, {
        resourceImportsByNode: {
          [nodeId]: [],
        },
      });
    },
    onSuccess: (_, { canvasId }) => {
      queryClient.invalidateQueries({
        queryKey: nodeKeys.detail(canvasId),
      });
    },
  });
};
