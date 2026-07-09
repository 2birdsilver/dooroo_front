import { useEffect, useState } from "react";

import DiaryCalendar from "./DiaryCalendar";
import DiaryContent from "./DiaryContent";
import DiaryNavigator from "./DiaryNavigator";
import DiaryWrite from "./DiaryWrite";

import { Diary } from "../types/diary";
import { diaryApi } from "../api/diaryApi";

interface DiaryTabProps {
  isOwner: boolean; // 스페이스 주인 여부를 prop으로 받음
  spaceId: number; // 스페이스 ID를 prop으로 받음
}

const DiaryTab = ({ isOwner, spaceId }: DiaryTabProps) => {
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calMonth, setCalMonth] = useState(new Date());

  // API로부터 받아온 실제 일기 데이터를 저장할 상태관리
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(false);

  // 달력 점 마킹용 데이터 상태
  const [diaryDates, setDiaryDates] = useState<Set<string>>(new Set());

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

  // 💡 특정 연/월의 일기 작성일 목록을 가져오는 함수 (그대로 유지)
  const fetchMonthlyDiaryDates = async (date: Date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 0~11로 나오므로 +1

      const activeDates: string[] = await diaryApi.getDiaryDatesByMonth(
        year,
        month,
        spaceId,
      );
      setDiaryDates(new Set(activeDates));
    } catch (error) {
      console.error("월별 일기 목록 조회 실패:", error);
    }
  };

  // 💡 일기 상세 데이터를 조회하는 함수
  const loadDiary = async () => {
    setLoading(true);
    try {
      const dateStr = formatDate(selectedDate);
      const data = await diaryApi.getDiaryByDate(spaceId, dateStr);
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

  // 💡 [진짜 통합] 하나의 useEffect에서 상세 데이터와 월별 마킹 데이터를 모두 제어합니다.
  useEffect(() => {
    const loadDiaryAndCalendarData = async () => {
      setLoading(true);
      try {
        // 1. 일기 상세 정보 조회
        const dateStr = formatDate(selectedDate);
        const diaryData = await diaryApi.getDiaryByDate(spaceId, dateStr);
        setSelectedDiary(diaryData);

        // 2. 달력 마킹용 데이터 조회
        const year = calMonth.getFullYear();
        const month = calMonth.getMonth() + 1;
        const activeDates: string[] = await diaryApi.getDiaryDatesByMonth(
          year,
          month,
          spaceId,
        );
        setDiaryDates(new Set(activeDates));
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        // 에러가 나더라도 상세 일기는 null로 초기화해줍니다.
        setSelectedDiary(null);
      } finally {
        setLoading(false);
      }
    };

    loadDiaryAndCalendarData();

    // 의존성 배열에 관련된 모든 상태를 집어넣어 순차적 실행을 보장합니다.
  }, [selectedDate, calMonth, spaceId]);

  // 💡 [수정] 일기 작성/수정 완료 및 삭제 시 일기 상세 정보와 달력의 점도 실시간 업데이트
  const handleUpdateSuccess = () => {
    setIsWriting(false);
    setIsEditing(false);
    loadDiary();
    fetchMonthlyDiaryDates(calMonth); // 💡 새로고침 추가로 점 즉시 반영
  };

  // 💡 삭제 버튼 클릭 핸들러
  const handleDelete = async () => {
    if (!selectedDiary) return;
    if (!window.confirm("정말로 이 일기를 삭제하시겠습니까?")) return;

    try {
      await diaryApi.deleteDiary(selectedDiary.id);
      alert("일기가 삭제되었습니다.");
      loadDiary();
      fetchMonthlyDiaryDates(calMonth); // 💡 삭제 후 점 즉시 제거 반영
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
          onCancel={() => {
            setIsWriting(false);
            setIsEditing(false);
          }}
          onSuccess={handleUpdateSuccess}
        />
      ) : (
        <div className="space-y-5">
          <DiaryCalendar
            calMonth={calMonth}
            firstDay={firstDay}
            daysInMonth={daysInMonth}
            selectedDate={selectedDate}
            diaryDates={diaryDates}
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
          {!loading && isOwner && (
            <div className="flex justify-end gap-2">
              {selectedDiary === null ? (
                <button
                  onClick={() => setIsWriting(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  작성하기
                </button>
              ) : (
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
