import type { Editor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import React, { useRef } from "react";
import { LuBold, LuItalic, LuUnderline, LuImage } from "react-icons/lu";

interface Props {
  editor: Editor;
}

const DiaryToolbar = ({ editor }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // event.target.files가 존재하지 않을 수 있으므로 옵셔널 체이닝(?.)을 사용하거나 체크합니다.
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/images/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      const data = await response.json();
      const imageUrl = data.url;

      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex gap-2 border-b p-2">
      {/* 굵게 버튼 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive("bold") ? "bg-gray-200 text-black font-bold" : "text-gray-600"}`}
      >
        <LuBold size={18} />
      </button>

      {/* 기울임 버튼 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive("italic") ? "bg-gray-200 text-black" : "text-gray-600"}`}
      >
        <LuItalic size={18} />
      </button>

      {/* 밑줄 버튼 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive("underline") ? "bg-gray-200 text-black" : "text-gray-600"}`}
      >
        <LuUnderline size={18} />
      </button>

      {/* 이미지 추가 버튼 [cite: 5] */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
      >
        <LuImage size={18} />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default DiaryToolbar;
