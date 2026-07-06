import { ChevronLeft, ChevronRight } from "lucide-react";

interface DiaryCalendarProps {
  calMonth: Date;
  firstDay: number;
  daysInMonth: number;
  selectedDate: Date;
  diaryDates: Set<string>;

  setCalMonth: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;

  formatDate: (date: Date) => string;
}

const DiaryCalendar = ({
  calMonth,
  firstDay,
  daysInMonth,
  selectedDate,
  diaryDates,
  setCalMonth,
  setSelectedDate,
  formatDate,
}: DiaryCalendarProps) => {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--secondary)" }}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            const dayInPrevMonth = new Date(
              calMonth.getFullYear(),
              calMonth.getMonth() - 1,
              1,
            );
            setCalMonth(dayInPrevMonth);
            setSelectedDate(dayInPrevMonth);
          }}
          className="p-1 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft size={15} style={{ color: "var(--muted-foreground)" }} />
        </button>

        <h3 className="text-sm font-semibold text-foreground">
          {calMonth.getFullYear()}년 {calMonth.getMonth() + 1}월
        </h3>

        <button
          onClick={() => {
            const dayInNextMonth = new Date(
              calMonth.getFullYear(),
              calMonth.getMonth() + 1,
              1,
            );
            setCalMonth(dayInNextMonth);
            setSelectedDate(dayInNextMonth);
          }}
          className="p-1 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronRight
            size={15}
            style={{ color: "var(--muted-foreground)" }}
          />
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div
            key={d}
            className="text-center text-[11px] text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;

          const ds = `${calMonth.getFullYear()}-${String(
            calMonth.getMonth() + 1,
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const hasDiary = diaryDates.has(ds);
          const isSelected = formatDate(selectedDate) === ds;

          return (
            <button
              key={day}
              onClick={() =>
                setSelectedDate(
                  new Date(calMonth.getFullYear(), calMonth.getMonth(), day),
                )
              }
              className="relative text-center text-xs py-1.5 rounded-lg transition-all"
              style={{
                background: isSelected
                  ? "var(--primary)"
                  : hasDiary
                    ? "rgba(184,122,82,0.18)"
                    : "transparent",
                color: isSelected
                  ? "var(--primary-foreground)"
                  : "var(--foreground)",
                fontWeight: isSelected || hasDiary ? 600 : 400,
              }}
            >
              {day}

              {hasDiary && !isSelected && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{
                    background: "var(--primary)",
                    opacity: 0.6,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DiaryCalendar;
