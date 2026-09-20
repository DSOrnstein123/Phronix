import { useQuery } from "@tanstack/react-query";
import { nodeKeys } from "../../keys";
import { nodeService } from "../service";

const useNodeName = (id: string) => {
  return useQuery({
    queryKey: nodeKeys.detail(id),
    queryFn: () => nodeService.getDetail(id),
    select: (data) => data.name,
    staleTime: Infinity,
  });
};

export default useNodeName;
