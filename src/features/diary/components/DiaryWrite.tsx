import { useState } from "react";
import TiptapEditor from "./TiptapEditor";
import { diaryApi } from "../api/diaryApi"; // 💡 앞서 만든 API 불러오기

interface Props {
  onCancel: () => void;
  onSuccess?: () => void; // 💡 등록 완료 후 목록 새로고침 등을 위한 콜백 (선택)
  selectedDate: Date; // 💡 선택된 날짜를 DiaryWrite에 전달
}

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const DiaryWrite = ({ selectedDate, onCancel, onSuccess }: Props) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // 💡 에디터 본문을 담을 상태 추가
  const [loading, setLoading] = useState(false);

  // 현재 유저 및 스페이스 정보 세팅 (실제 환경에 맞게 토큰이나 Context 주입 필요)
  const currentUserId = 1;
  const currentSpaceId = 10;

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
      setLoading(false);

      // 💡 API 호출하여 데이터 등록
      await diaryApi.createDiary({
        userId: currentUserId,
        spaceId: currentSpaceId,
        diaryDate: formatDate(selectedDate), // "2026-07-04" 형식
        title: title,
        content: content, // 에디터에서 수집된 HTML 스트링
      });

      alert("일기가 성공적으로 등록되었습니다!");
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
      <input
        className="w-full rounded-lg border p-3"
        placeholder="제목을 입력하세요."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />

      {/* 💡 에디터 내용이 바뀔 때마다 부모의 content 상태를 업데이트하도록 함수 전달 */}
      <TiptapEditor onChange={setContent} />

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border"
          disabled={loading}
        >
          취소
        </button>

        <button
          onClick={handleSave} // 💡 저장 함수 연결
          className="px-4 py-2 rounded-lg bg-primary text-white disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
};

export default DiaryWrite;
