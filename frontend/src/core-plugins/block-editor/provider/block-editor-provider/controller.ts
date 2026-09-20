import { Editor } from "@system/lib/tiptap";
import type { EditorStore } from "./store";
import { NodeStoreController } from "@system/entry/categories/node/core/controller";
import { nodeLinkService } from "@system/entry/categories/node/link/service";
import { queryClient } from "@system/config/queryClient";
import { nodeKeys } from "@system/entry/categories/node/keys";

export class EditorController extends NodeStoreController<EditorStore> {
  private editor: Editor | null = null;
  private readonly listeners = new Set<() => void>();

  readonly api = {
    ...this.nodeApi(),
    ...this.editorApi(),
  };

  protected editorApi() {
    return {
      getEditor: this.getEditor.bind(this),
      setEditor: this.setEditor.bind(this),
      subcribeEditor: this.subcribeEditor.bind(this),
      createNodeLink: this.createNodeLink.bind(this),
    };
  }

  getEditor() {
    return this.editor;
  }

  setEditor(editor: Editor) {
    this.editor = editor;

    this.listeners.forEach((listener) => listener());
  }

  subcribeEditor(listener: () => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async createNodeLink(sourceNodeId: string, targetNodeId: string) {
    await nodeLinkService.createLinkWithMetadata(sourceNodeId, targetNodeId);

    queryClient.invalidateQueries({
      queryKey: nodeKeys.links(),
    });
  }

  override destroy() {
    this.editor?.destroy();
  }
}
