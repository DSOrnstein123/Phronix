import { useQuery } from "@tanstack/react-query";
import { nodeKeys } from "../../keys";
import { nodeLinkService } from "../service";

export const useBacklinks = (targetNodeId: string) => {
  return useQuery({
    queryKey: nodeKeys.backlinks(targetNodeId),
    queryFn: () => nodeLinkService.getBacklinks(targetNodeId),
  });
};
