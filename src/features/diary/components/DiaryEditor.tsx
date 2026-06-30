import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import DiaryToolbar from "./DiaryToolbar";

import "../css/DiaryEditor.css";

const DiaryEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden">
      <DiaryToolbar editor={editor} />

      <EditorContent editor={editor} className="editor" />
    </div>
  );
};

export default DiaryEditor;
