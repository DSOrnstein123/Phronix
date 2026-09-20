import { useQuery } from "@tanstack/react-query";
import { nodeKeys } from "../../keys";
import { nodeService } from "../service";

const useNodeIcon = (id: string) => {
  return useQuery({
    queryKey: nodeKeys.detail(id),
    queryFn: () => nodeService.getDetail(id),
    select: (data) => data.icon,
    staleTime: Infinity,
  });
};

export default useNodeIcon;
