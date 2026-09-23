import type {
  AuxiliaryConfig,
  SegmentConfig,
  SegmentId,
} from "@system/entry/auxiliary/auxiliary";
import type {
  NodeConfig,
  NodeNamePlaceholder,
  NodeSlots,
  RegisteredNodeConfig,
} from "../entry/categories/node/core/types";
import type {
  Plugin,
  PluginId,
  PluginRegistryMap,
  NodeType,
  ToolType,
  EntryType,
  PluginConfig,
} from "./plugin";
import type { ToolConfig } from "./tool";
import {
  FORWARD_LINK_SEGMENT_ID,
  forwardLinkConfig,
} from "@system/entry/categories/node/segment/forward-link";

type ExtractPluginApi<P extends PluginId> = PluginRegistryMap[P] extends {
  api: infer A;
}
  ? A
  : never;

export class PluginManager {
  private pluginConfigs = new Map<PluginId, PluginConfig>();
  private nodeConfigs = new Map<NodeType, RegisteredNodeConfig>();
  private toolConfigs = new Map<ToolType, ToolConfig>();
  private segmentConfigs = new Map<SegmentId, SegmentConfig>([
    [FORWARD_LINK_SEGMENT_ID, forwardLinkConfig],
  ]);

  register(plugin: Plugin) {
    //TODO: normalize registerd plugin
    const { id: pluginId, entries, segments, ...metadata } = plugin;

    if (this.pluginConfigs.has(pluginId))
      throw new Error(`Plugin '${pluginId}' already registered`);

    this.pluginConfigs.set(pluginId, { ...metadata, entries: entries });

    if (segments) {
      segments.forEach((segmentConfig) => {
        this.segmentConfigs.set(segmentConfig.id, segmentConfig);
      });
    }

    if (!entries) return;

    if (entries.nodes) {
      Object.entries(entries.nodes).forEach((entry) => {
        const [nodeType, nodeConfig] = entry as [NodeType, NodeConfig];

        if (this.nodeConfigs.has(nodeType)) {
          throw new Error(`Node type "${nodeType}" already registered`);
        }

        this.nodeConfigs.set(nodeType, {
          namePlaceholder: "Untitled",
          ...nodeConfig,
          kind: nodeConfig.kind ?? "file",
          auxiliary: {
            ...nodeConfig.auxiliary,
            segments: [
              ...(nodeConfig.auxiliary?.segments ?? []),
              FORWARD_LINK_SEGMENT_ID,
            ],
          },
        });
      });
    }

    if (entries.tools) {
      Object.entries(entries.tools).forEach((entry) => {
        const [toolType, toolConfig] = entry as [ToolType, ToolConfig];

        if (this.toolConfigs.has(toolType)) {
          throw new Error(`Tool type "${toolType}" already registered`);
        }

        this.toolConfigs.set(toolType, toolConfig);
      });
    }
  }

  hasNode(node: string): node is NodeType {
    return this.nodeConfigs.has(node as NodeType);
  }

  registerNodeSlot<N extends NodeType>(
    nodeType: N,
    slots: Partial<NodeSlots<N>>,
  ) {
    const nodeConfig = this.nodeConfigs.get(nodeType);
    if (!nodeConfig) {
      throw new Error(
        `[PluginManager] node type '${nodeType}' is not registered`,
      );
    }

    nodeConfig.slots = {
      ...nodeConfig.slots,
      ...slots,
    };
  }

  getPluginConfigs() {
    return this.pluginConfigs;
  }

  getEntryConfig(entryType: EntryType) {
    const config =
      this.nodeConfigs.get(entryType as NodeType) ??
      this.toolConfigs.get(entryType as ToolType);

    if (!config) {
      throw new Error(`${entryType} is not registered`);
    }

    return config;
  }

  getNodeView(nodeType: NodeType) {
    const nodeConfig = this.nodeConfigs.get(nodeType);
    if (!nodeConfig || !nodeConfig.view) {
      throw new Error(
        `[PluginManager] Cannot find component for plugin '${nodeType}'`,
      );
    }
    return nodeConfig.view;
  }

  getToolView(toolType: ToolType) {
    const nodeConfig = this.toolConfigs.get(toolType);
    if (!nodeConfig || !nodeConfig.view) {
      throw new Error(
        `[PluginManager] Cannot find component for plugin '${toolType}'`,
      );
    }
    return nodeConfig.view;
  }

  getNodeSchema(nodeType: NodeType) {
    const nodeConfig = this.nodeConfigs.get(nodeType);
    if (!nodeConfig || !nodeConfig.schema) {
      throw new Error(
        `[PluginManager] Cannot find schema for node type '${nodeType}'`,
      );
    }
    return nodeConfig.schema;
  }

  getPluginActionButtons(pluginId: PluginId) {
    const plugin = this.pluginConfigs.get(pluginId);
    if (!plugin) {
      throw new Error(`[PluginManager] Plugin '${pluginId}' is not registered`);
    }
    return plugin.actionButtons;
  }

  getNodeNamePlaceholder<N extends NodeType, T = NodeNamePlaceholder<N>>(
    nodeType: N,
  ) {
    const nodeConfig = this.nodeConfigs.get(nodeType);
    if (!nodeConfig) {
      throw new Error(
        `[PluginManager] node type '${nodeType}' is not registered`,
      );
    }

    return nodeConfig.namePlaceholder as T;
  }

  getNodeActionButton(nodeType: NodeType) {
    const nodeConfig = this.nodeConfigs.get(nodeType);
    if (!nodeConfig) {
      throw new Error(
        `[PluginManager] node type '${nodeType}' is not registered`,
      );
    }
    return nodeConfig.actionButtons;
  }

  getActionButtons() {
    return Array.from(this.pluginConfigs.values()).flatMap((config) => {
      const pluginActionButtons = config.actionButtons ?? [];

      const pluginEntries = config.entries;
      const nodeActionButtons = pluginEntries?.nodes
        ? Object.values(pluginEntries.nodes).flatMap(
            (node) => node.actionButtons ?? [],
          )
        : [];
      const toolActionButtons = pluginEntries?.tools
        ? Object.values(pluginEntries.tools).flatMap(
            (tool) => tool.actionButtons ?? [],
          )
        : [];
      return [
        ...pluginActionButtons,
        ...nodeActionButtons,
        ...toolActionButtons,
      ];
    });
  }

  getNodeSlot<N extends NodeType, S extends keyof NodeSlots<N> & string>(
    nodeType: N,
    slot: S,
  ): NodeSlots<N>[S] {
    const nodeConfig = this.nodeConfigs.get(nodeType);
    if (!nodeConfig) {
      throw new Error(
        `[PluginManager] node type '${nodeType}' is not registered`,
      );
    }
    return nodeConfig.slots?.[slot] as NodeSlots<N>[S];
  }

  getApi<P extends PluginId>(pluginId: P): ExtractPluginApi<P> {
    const plugin = this.pluginConfigs.get(pluginId);
    if (!plugin) {
      throw new Error(`[PluginManager] Plugin '${pluginId}' is not registered`);
    }
    return plugin.api as ExtractPluginApi<P>;
  }

  getAuxiliaryConfigs() {
    return new Map(
      [...this.nodeConfigs].reduce<[NodeType, AuxiliaryConfig][]>(
        (result, [nodeType, nodeConfig]) => {
          if (nodeConfig.auxiliary) {
            result.push([nodeType, nodeConfig.auxiliary]);
          }
          return result;
        },
        [],
      ),
    );
  }

  getAuxiliaryConfig(entryType: EntryType) {
    const config =
      this.nodeConfigs.get(entryType) ?? this.toolConfigs.get(entryType);

    if (!config) {
      throw new Error(`Entry ${entryType} is not registered`);
    }

    return config.auxiliary;
  }

  hasAuxiliary(entryType: EntryType) {
    return Boolean(this.getAuxiliaryConfig(entryType));
  }

  private getSegmentIds(entryType: EntryType) {
    const auxiliaryConfig = this.getAuxiliaryConfig(entryType);

    if (!auxiliaryConfig) {
      throw new Error(`Auxiliary of ${entryType} is not registered`);
    }

    return auxiliaryConfig.segments;
  }

  getSegments(entryType: EntryType) {
    const segments = new Map<SegmentId, SegmentConfig>();
    const segmentIds = this.getSegmentIds(entryType);

    segmentIds.forEach((segmentId) => {
      const segmentConfig = this.segmentConfigs.get(segmentId);

      if (!segmentConfig) {
        throw new Error(`Segment ${segmentId} is not registered`);
      }

      segments.set(segmentId, segmentConfig);
    });

    return segments;
  }
}

export const pluginManager = new PluginManager();
