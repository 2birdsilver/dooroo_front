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

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calMonth, setCalMonth] = useState(new Date());

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

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

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

  // API로부터 받아온 실제 일기 데이터를 저장할 상태관리
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      {isWriting ? (
        <DiaryWrite onCancel={() => setIsWriting(false)} />
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

          <div className="flex justify-end">
            <button
              onClick={() => setIsWriting(true)}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              작성하기
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DiaryTab;
