import { useQueryClient } from "@tanstack/react-query";
import { nodeService } from "@system/entry/categories/node/core/service";
import useCurrentNodeId from "@system/workbench/tab/hooks/useCurrentNodeId";
import { nodeKeys } from "@system/entry/categories/node/keys";
import { TEMPLATE_CONFIG } from "../../../../../template-manager/constants";
import useOptimisticRename from "@system/shared/hooks/useOptimisticRename";
import useGetCurrentNameQuery from "./useGetCurrentNameQuery";
import type { NodeDetail } from "../types";
import type { TemplateMetadataList } from "@system/entry/categories/node/kinds/template/schema";
import type { TYPE } from "../identity";

const useRename = () => {
  const id = useCurrentNodeId();
  const { data: name } = useGetCurrentNameQuery();
  const queryClient = useQueryClient();

  const { rename, commit } = useOptimisticRename({
    onOptimisticUpdate: (newName) => {
      queryClient.setQueryData<TemplateMetadataList>(
        nodeKeys.list(TEMPLATE_CONFIG),
        (data) =>
          data?.map((node) =>
            node.id == id ? { ...node, name: newName } : node,
          ),
      );

      queryClient.setQueryData<NodeDetail>(
        nodeKeys.detail(id),
        (data) =>
          data && {
            ...data,
            data: {
              ...data.data,
              defaultName: newName,
            },
          },
      );
    },
    onCommit: async (newName) => {
      await nodeService.patchData<TYPE>(id, {
        defaultName: newName,
      });
    },
  });

  return { name, rename, commit };
};

export default useRename;
