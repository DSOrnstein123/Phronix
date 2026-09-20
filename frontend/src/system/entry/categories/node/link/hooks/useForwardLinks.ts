import { useQuery } from "@tanstack/react-query";
import { nodeKeys } from "../../keys";
import { nodeLinkService } from "../service";

export const useForwardLinks = (sourceNodeId: string) => {
  return useQuery({
    queryKey: nodeKeys.forwardLinks(sourceNodeId),
    queryFn: () => nodeLinkService.getForwardLinks(sourceNodeId),
  });
};
