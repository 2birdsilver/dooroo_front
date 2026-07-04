import { useEffect, useState } from "react";

import DiaryCalendar from "./DiaryCalendar";
import DiaryContent from "./DiaryContent";
import DiaryNavigator from "./DiaryNavigator";
import DiaryWrite from "./DiaryWrite";

import { DIARY_ENTRIES } from "../../../mocks/mockData";
import { Diary } from "../types/diary";
import { diaryApi } from "../api/diaryApi";

const DiaryTab = () => {
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calMonth, setCalMonth] = useState(new Date());

  // API로부터 받아온 실제 일기 데이터를 저장할 상태관리
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

  // 💡 일기 데이터를 다시 불러오는 함수 (삭제 성공 후 호출용)
  const loadDiary = async () => {
    setLoading(true);
    try {
      const dateStr = formatDate(selectedDate);
      const data = await diaryApi.getDiaryByDate(10, dateStr);
      setSelectedDiary(data);
    } catch (error) {
      console.error(error);
      setSelectedDiary(null);
    } finally {
      setLoading(false);
    }
  };

  const firstDay = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth(),
    1,
  ).getDay();

  const daysInMonth = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth() + 1,
    0,
  ).getDate();

  const formatDisplayDate = (date: Date) =>
    `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  const navigateDay = (offset: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);

    setSelectedDate(next);

    // 달이 바뀌면 달력도 같이 이동
    if (
      next.getMonth() !== calMonth.getMonth() ||
      next.getFullYear() !== calMonth.getFullYear()
    ) {
      setCalMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  useEffect(() => {
    const loadDiary = async () => {
      setLoading(true);
      try {
        const dateStr = formatDate(selectedDate); // 예: "2026-07-04"

        // 💡 분리된 diaryApi를 사용하여 날짜 기반 fetch 호출 실행
        const data = await diaryApi.getDiaryByDate(10, dateStr);

        setSelectedDiary(data); // 찾은 일기 데이터를 주입 (없으면 null)
      } catch (error) {
        console.error(error);
        setSelectedDiary(null);
      } finally {
        setLoading(false);
      }
    };

    loadDiary();
  }, [selectedDate]); // 💡 selectedDate가 바뀔 때마다 서버를 찔러 데이터를 가져옴

  useEffect(() => {
    loadDiary();
  }, [selectedDate]);

  // 💡 삭제 버튼 클릭 핸들러 예시
  const handleDelete = async () => {
    if (!selectedDiary) return;
    if (!window.confirm("정말로 이 일기를 삭제하시겠습니까?")) return;

    try {
      await diaryApi.deleteDiary(selectedDiary.id);
      alert("일기가 삭제되었습니다.");
      loadDiary(); // 💡 삭제 후 데이터 다시 조회 (화면 자동 갱신)
    } catch (error) {
      console.error(error);
      alert("일기 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {isWriting ? (
        <DiaryWrite
          selectedDate={selectedDate}
          initialData={isEditing ? selectedDiary : null}
          onCancel={
            () => {
              setIsWriting(false);
              setIsEditing(false);
            } // 취소 시 수정 모드도 해제
          }
          onSuccess={() => {
            setIsWriting(false);
            setIsEditing(false);
            loadDiary();
          }}
        />
      ) : (
        <div className="space-y-5">
          <DiaryCalendar
            calMonth={calMonth}
            firstDay={firstDay}
            daysInMonth={daysInMonth}
            selectedDate={selectedDate}
            diaryDates={new Set(Object.keys(DIARY_ENTRIES))}
            setCalMonth={setCalMonth}
            setSelectedDate={setSelectedDate}
            formatDate={formatDate}
          />

          <DiaryNavigator
            selectedDate={selectedDate}
            navigateDay={navigateDay}
            formatDisplayDate={formatDisplayDate}
          />

          <DiaryContent diary={selectedDiary} />

          {/* 하단 버튼 영역 */}
          {!loading && (
            <div className="flex justify-end gap-2">
              {/* 💡 조건 A: 일기가 없을 때만 '작성하기' 표출 */}
              {selectedDiary === null ? (
                <button
                  onClick={() => setIsWriting(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  작성하기
                </button>
              ) : (
                /* 💡 조건 B: 일기가 존재할 때만 '수정', '삭제' 표출 */
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsWriting(true);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DiaryTab;
