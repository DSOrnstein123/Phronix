import { nodeKeys } from "@system/entry/categories/node/keys";
import { nodeService } from "@system/entry/categories/node/core/service";
import { queryClient } from "@system/config/queryClient";
import { DEFAULT_DOCUMENT_VALUES } from "../constants";
import type { NodeMetadataList } from "@system/entry/categories/node/core/schema";
import { EXPLORER_CONFIG } from "@core-plugins/file-explorer/tools/constants";

const createDocument = async () => {
  const data = await nodeService.create(DEFAULT_DOCUMENT_VALUES);

  queryClient.setQueryData<NodeMetadataList>(
    nodeKeys.list(EXPLORER_CONFIG),
    (oldData = []) => [...oldData, data],
  );

  return data;
};

export default createDocument;
