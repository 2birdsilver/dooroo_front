import { useState } from "react";

import DiaryCalendar from "./components/DiaryCalendar";
import DiaryContent from "./components/DiaryContent";
import DiaryNavigator from "./components/DiaryNavigator";
import DiaryWrite from "./components/DiaryWrite";

import { DIARY_ENTRIES } from "../../mocks/mockData";

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

  const selectedDiary = DIARY_ENTRIES[formatDate(selectedDate)] ?? null;

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
