import type { Editor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import React, { useRef, useState } from "react";
import { LuBold, LuItalic, LuUnderline, LuImage } from "react-icons/lu";
import imageCompression from "browser-image-compression";
import type {} from "@tiptap/extension-bold";
import type {} from "@tiptap/extension-italic";
import type {} from "@tiptap/extension-underline";

interface Props {
  editor: Editor;
}

const DiaryToolbar = ({ editor }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isUploading) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const fileArray = Array.from(files).slice(0, 10);
    if (files.length > 10) {
      alert("10장을 초과하여 선택하셨습니다. 앞의 10장만 업로드합니다.");
    }

    // 1. [핵심 수정] 모든 업로드 요청을 배열로 생성 (병렬 처리 시작)
    const uploadTasks = fileArray.map(async (file) => {
      let fileToSend = file;
      const fileSizeKB = file.size / 1024;
      const MAX_SIZE_KB = 500;

      // 용량 체크 및 압축 로직 (동일)
      if (fileSizeKB > MAX_SIZE_KB) {
        try {
          const options = {
            maxSizeMB: MAX_SIZE_KB / 1024,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          fileToSend = new File([compressedFile], file.name, {
            type: file.type,
          });
        } catch (compressionError) {
          console.error("이미지 압축 중 오류 발생:", compressionError);
        }
      }

      // 서버 업로드 fetch 요청
      const formData = new FormData();
      formData.append("file", fileToSend);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/images/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("서버 응답 실패");
      const data = await response.json();
      return data.url; // 서버에서 반환된 이미지 URL
    });

    // 2. [핵심 수정] 모든 업로드가 완료될 때까지 대기
    try {
      const imageUrls = await Promise.all(uploadTasks);

      // 3. [핵심 수정] 모든 URL을 에디터에 순차적으로 삽입
      // 에디터 인스턴스가 준비되었는지 확인
      if (!editor) return;

      imageUrls.forEach((url) => {
        editor
          .chain()
          .focus()
          .insertContent(`<p><img src="${url}" /></p><p></p>`)
          .run();

        // 삽입 후 커서를 문서의 끝으로 이동
        editor.commands.setTextSelection(editor.state.doc.content.size);
      });
    } catch (error) {
      console.error("이미지 처리 중 오류 발생:", error);
      alert("이미지 업로드 중 문제가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = "";
      }
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
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={
          isUploading ? "p-1.5 rounded hover:bg-gray-100 text-gray-600" : ""
        }
      >
        <LuImage size={18} />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        style={{ display: "none" }}
      />

      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-medium">사진 업로드 중...</p>
            <p className="text-gray-500 text-sm">잠시만 기다려 주세요</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryToolbar;
