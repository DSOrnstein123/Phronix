import { useQuery } from "@tanstack/react-query";
import { nodeKeys } from "../../keys";
import { nodeService } from "../service";
import type { NodeListOptions } from "../types/payload";
import type { NodeMetadataList } from "../schema";

export const useGetNodes = <N extends NodeMetadataList>(
  options: NodeListOptions = {},
) => {
  return useQuery<N>({
    queryKey: nodeKeys.list(options),
    queryFn: () => nodeService.getList(options) as unknown as N,
    staleTime: Infinity,
  });
};
