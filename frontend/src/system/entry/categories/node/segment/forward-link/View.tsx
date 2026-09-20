import { useCurrentNodeId } from "@system/workbench/core/hooks/useCurrentNodeId";
import { useForwardLinks } from "../../link/hooks/useForwardLinks";

export const View = () => {
  const id = useCurrentNodeId();
  const { data: forwardLinks = [] } = useForwardLinks(id);

  return (
    <div>
      {forwardLinks.map((forwardLink) => (
        <div>{forwardLink.name}</div>
      ))}
    </div>
  );
};
