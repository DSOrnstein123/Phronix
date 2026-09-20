import { useQuery, useQueryClient } from "@tanstack/react-query";
import { nodeKeys } from "../../keys";
import { nodeService } from "../service";

export const useGetDetailsQuery = (ids: string[]) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["nodes", "fetch-details", ids],
    queryFn: async () => {
      const nodes = await nodeService.getDetails(ids);

      nodes.forEach((node) => {
        queryClient.setQueryData(nodeKeys.detail(node.id), node);
      });

      return nodes;
    },
    enabled: ids.length > 0,
    gcTime: 0,
  });
};
