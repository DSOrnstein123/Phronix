import type {
  PluginId,
  PluginRegistryMap,
} from "@system/plugin-manager/plugin";
import type { IconData } from "@system/shared/schemas/iconData";
import type { BaseController } from "@system/workbench/tab/classes/baseController";
import type { ComponentType } from "react";
import type { StoreApi } from "zustand";

export interface AuxiliaryConfig {
  icon?: IconData;
  segments: SegmentId[];
}

export interface SegmentConfig {
  id: string;
  name?: string;
  //TODO: remove "?" later
  icon?: IconData;
  view: ComponentType;
  createController?: () => BaseController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createStore?: () => StoreApi<any>;
}

type ExtractSegmentId<T> = T extends {
  segments: (infer S)[];
}
  ? S extends { id: infer I }
    ? I
    : never
  : never;

export type SegmentId = {
  [P in PluginId]: ExtractSegmentId<PluginRegistryMap[P]>;
}[PluginId];
