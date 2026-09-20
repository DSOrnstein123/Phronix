import { nodeKeys } from "@system/entry/categories/node/keys";
import type { NodeDetailMap } from "@system/entry/categories/node/core/types";
import type { NodeType } from "@system/plugin-manager/plugin";
import { templateApi } from "./template";
import { nodeService } from "@system/entry/categories/node/core/service";
import type {
  CreateNodePayload,
  NodeListOptions,
} from "@system/entry/categories/node/core/types/payload";

export const nodeApi = {
  keys: nodeKeys,

  get: (id: string) => nodeService.getDetail(id),
  getList: (options?: NodeListOptions) => nodeService.getList(options),
  create: (payload: CreateNodePayload) => nodeService.create(payload),
  rename: (id: string, name: string) => nodeService.updateName(id, name),
  updateData: <N extends NodeType>(
    id: string,
    newData: Partial<NodeDetailMap<N>["data"]>,
  ) => nodeService.patchData(id, newData),

  template: { ...templateApi },
};
