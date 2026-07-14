import { useState } from "react";
import TiptapEditor from "./TiptapEditor";
import { diaryApi } from "../api/diaryApi"; // 💡 앞서 만든 API 불러오기
import { Diary } from "../types/diary";

interface Props {
  onCancel: () => void;
  onSuccess?: () => void; // 💡 등록 완료 후 목록 새로고침 등을 위한 콜백 (선택)
  selectedDate: Date; // 💡 선택된 날짜를 DiaryWrite에 전달
  initialData: Diary | null; // 💡 수정 모드일 때 기존 일기 데이터를 전달
}

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // "2026-08-15" 생성
};

const DiaryWrite = ({
  selectedDate,
  initialData,
  onCancel,
  onSuccess,
}: Props) => {
  const spaceId = localStorage.getItem("spaceId");
  const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).id : null;

  const [title, setTitle] = useState(initialData?.title || ""); // 💡 수정 모드일 때 기존 제목 세팅
  const [content, setContent] = useState(initialData?.content || ""); // 💡 수정 모드일 때 기존 내용 세팅
  const [loading, setLoading] = useState(false);

  // 현재 유저 및 스페이스 정보 세팅 (실제 환경에 맞게 토큰이나 Context 주입 필요)
  const currentUserId = userId;
  const currentSpaceId = spaceId;
  const isEditMode = !!initialData;

  // 저장 버튼 핸들러
  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }
    // Tiptap 비어있을 때 기본값 세팅 예외 처리 (선택)
    if (!content || content === "<p></p>") {
      alert("내용을 입력하세요.");
      return;
    }

    try {
      setLoading(true);
      if (initialData) {
        // 💡 수정 모드일 때 API 호출
        await diaryApi.updateDiary(initialData.id, {
          userId: initialData.userId,
          spaceId: initialData.spaceId,
          diaryDate: getLocalDateString(selectedDate),
          title: title,
          content: content,
        });
        alert("일기가 성공적으로 수정되었습니다!");
      } else {
        // 💡 API 호출하여 데이터 등록
        await diaryApi.createDiary({
          userId: currentUserId,
          spaceId: currentSpaceId ? parseInt(currentSpaceId) : 0,
          diaryDate: getLocalDateString(selectedDate), // "2026-07-04" 형식
          title: title,
          content: content, // 에디터에서 수집된 HTML 스트링
        });

        alert("일기가 성공적으로 등록되었습니다!");
      }
      if (onSuccess) onSuccess(); // 성공 콜백 호출
      onCancel(); // 등록 후 작성 창 닫기
    } catch (error) {
      console.error("등록 실패:", error);
      alert("일기 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {isEditMode ? "일기 수정하기" : "일기 작성하기"}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border"
            disabled={loading}
          >
            취소
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            {isEditMode ? "수정 완료" : "등록"}
          </button>
        </div>
      </div>

      <input
        className="w-full rounded-lg border p-3"
        placeholder="제목을 입력하세요."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />

      {/* 💡 에디터 내용이 바뀔 때마다 부모의 content 상태를 업데이트하도록 함수 전달 */}
      <TiptapEditor onChange={setContent} initialContent={content} />
    </div>
  );
};

export default DiaryWrite;
