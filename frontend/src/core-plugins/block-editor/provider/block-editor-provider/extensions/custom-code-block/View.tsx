import { NodeViewContent, type NodeViewProps } from "@system/lib/tiptap";
import { FloatBlockWrapper } from "../float-block/FloatBlockWrapper";

export const View = ({ node, updateAttributes, extension }: NodeViewProps) => {
  const languages = extension.options.lowlight.listLanguages();

  return (
    <FloatBlockWrapper>
      <select
        contentEditable={false}
        className="absolute top-2 right-2 z-10 cursor-pointer rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 outline-none hover:bg-gray-700"
        value={node.attrs.language || "null"}
        onChange={(event) => updateAttributes({ language: event.target.value })}
      >
        <option value="null">Auto</option>
        {languages.map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <pre className="m-0! mt-4 bg-transparent! p-0!">
        <NodeViewContent
          as={"code" as "div"}
          className={`hljs min-h-6 font-mono text-sm outline-none ${
            node.attrs.language ? `language-${node.attrs.language}` : ""
          }`}
        />
      </pre>
    </FloatBlockWrapper>
  );
};
