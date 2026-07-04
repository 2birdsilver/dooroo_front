import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import DiaryToolbar from "./DiaryToolbar";

import "../css/Diary.css";

interface EditorProps {
  onChange: (html: string) => void; // 💡 부모에게 전달하기 위한 타입 정의
}

const TiptapEditor = ({ onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: false, // R2 URL을 사용할 것이므로 base64는 금지 [cite: 5]
      }),
    ],
    content: "",

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (typeof onChange === "function") {
        onChange(html);
      }
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* 툴바 */}
      <DiaryToolbar editor={editor} />

      {/* 에디터 본문 [cite: 5] */}
      <EditorContent editor={editor} className="editor" />
    </div>
  );
};

export default TiptapEditor;
