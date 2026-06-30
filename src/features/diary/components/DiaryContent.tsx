import type { Diary } from "../types";

interface Props {
  diary: Diary | null;
}

const DiaryContent = ({ diary }: Props) => {
  if (!diary) {
    return <div className="rounded-xl p-10 text-center">일기가 없습니다.</div>;
  }

  return (
    <div className="rounded-xl p-5">
      <h2 className="text-lg font-bold">{diary.title}</h2>

      <div className="text-sm text-gray-500 mb-3">{diary.diaryDate}</div>

      <div>{diary.content}</div>
    </div>
  );
};

export default DiaryContent;
