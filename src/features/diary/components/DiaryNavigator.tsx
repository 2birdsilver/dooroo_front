import { ChevronLeft, ChevronRight } from "lucide-react";

interface DiaryNavigatorProps {
  selectedDate: Date;
  navigateDay: (offset: number) => void;
  formatDisplayDate: (date: Date) => string;
}

const DiaryNavigator = ({
  selectedDate,
  navigateDay,
  formatDisplayDate,
}: DiaryNavigatorProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => navigateDay(-1)}
        className="p-2 rounded-xl transition-colors hover:bg-secondary"
      >
        <ChevronLeft size={20} style={{ color: "var(--muted-foreground)" }} />
      </button>

      <div className="text-sm font-semibold text-foreground">
        {formatDisplayDate(selectedDate)}
      </div>

      <button
        onClick={() => navigateDay(1)}
        className="p-2 rounded-xl transition-colors hover:bg-secondary"
      >
        <ChevronRight size={20} style={{ color: "var(--muted-foreground)" }} />
      </button>
    </div>
  );
};

export default DiaryNavigator;
