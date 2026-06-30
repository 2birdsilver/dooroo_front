import type { Editor } from "@tiptap/react";

interface Props {
  editor: Editor;
}

const DiaryToolbar = ({ editor }: Props) => {
  return (
    <div className="flex gap-2 border-b p-2">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </button>

      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        I
      </button>

      <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
        U
      </button>
    </div>
  );
};

export default DiaryToolbar;
