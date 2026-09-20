import { useQuery } from "@tanstack/react-query";
import { nodeService } from "../../../core/service";
import type { NodeListOptions } from "../../../core/types/payload";
import type { NodeMetadataList } from "../../../core/schema";
import { nodeKeys } from "../../../keys";

export const useGetNodes = <N extends NodeMetadataList>(
  options: NodeListOptions = {},
) => {
  return useQuery<N>({
    queryKey: nodeKeys.list(options),
    queryFn: () => nodeService.getList(options) as unknown as N,
    staleTime: Infinity,
  });
};
