import { systemApi } from "@system/api";
import type { EntryType } from "@system/plugin-manager/plugin";
import useActiveTabId from "@system/workbench/workspace/hooks/useActiveTabId";

export const useActiveTabEntryApi = <E extends EntryType>() => {
  const activeTabId = useActiveTabId();
  const activeTabApi = systemApi.workbench.getTabEntryApi<E>(activeTabId!);
  return activeTabApi;
};
