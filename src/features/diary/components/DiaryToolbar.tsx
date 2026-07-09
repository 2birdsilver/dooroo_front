import type { Editor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import React, { useRef } from "react";
import { LuBold, LuItalic, LuUnderline, LuImage } from "react-icons/lu";
import imageCompression from "browser-image-compression";

interface Props {
  editor: Editor;
}

const DiaryToolbar = ({ editor }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    let fileToSend = file;

    // 1. 용량 체크 (단위: Byte -> KB 변환)
    const fileSizeKB = file.size / 1024;
    const MAX_SIZE_KB = 500;

    // 300KB를 넘는 경우에만 압축 진행
    if (fileSizeKB > MAX_SIZE_KB) {
      try {
        // 2. 압축 옵션 설정
        const options = {
          maxSizeMB: MAX_SIZE_KB / 1024, // 라이브러리 단위가 MB이므로 0.29MB 형태로 변환 (약 300KB)
          maxWidthOrHeight: 1200, // 본문용 이미지에 적절한 가로/세로 최대 해상도
          useWebWorker: true,
        };

        console.log(`압축 전 용량: ${fileSizeKB.toFixed(2)}KB`);

        // 3. 이미지 압축 실행
        const compressedFile = await imageCompression(file, options);

        // 서버 전송을 위해 파일 객체 형태로 변환
        fileToSend = new File([compressedFile], file.name, {
          type: file.type,
        });

        console.log(`압축 후 용량: ${(fileToSend.size / 1024).toFixed(2)}KB`);
      } catch (compressionError) {
        console.error("이미지 압축 중 오류 발생:", compressionError);
        // 압축 실패 시 사용자 경험을 위해 원본으로 진행하거나, 알림을 띄울 수 있습니다.
      }
    }

    // 4. FormData에 최종 파일 담아서 서버 전송
    const formData = new FormData();
    formData.append("file", fileToSend);

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
