import useWorkbenchStore from "../store/useWorkbenchStore";

export const useCurrentNodeId = () => {
  const nodeId = useWorkbenchStore((state) => {
    if (state.currentEntry?.entryCategory !== "node") return null;

    return state.currentEntry.nodeId;
  });

  if (!nodeId) {
    throw new Error("Current entry is not a node");
  }

  return nodeId;
};
