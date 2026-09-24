import { useCurrentNodeId } from "@system/workbench/core/hooks/useCurrentNodeId";
import { useBacklinks } from "../../link/hooks/useBacklinks";

export const View = () => {
  const id = useCurrentNodeId();
  const { data: backlinks = [] } = useBacklinks(id);

  return (
    <div>
      {backlinks.map((backlink) => (
        <div>{backlink.name}</div>
      ))}
    </div>
  );
};
