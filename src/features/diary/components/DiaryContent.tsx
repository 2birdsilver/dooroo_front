import type { Diary } from "../types/diary";
import "../css/Diary.css";

interface Props {
  diary: Diary | null;
}

const DiaryContent = ({ diary }: Props) => {
  if (!diary) {
    return <div className="rounded-xl p-10 text-center">일기가 없습니다.</div>;
  }

  return (
    <div className="rounded-xl p-1">
      <h2 className="text-lg font-bold">{diary.title}</h2>

      <div className="text-sm text-gray-500 mb-3">{diary.diaryDate}</div>

      <div
        className="prose max-w-none text-gray-700 leading-relaxed min-h-[200px]"
        dangerouslySetInnerHTML={{ __html: diary.content }}
      />
    </div>
  );
};

export default DiaryContent;
