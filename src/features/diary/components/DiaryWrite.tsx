import { useState } from "react";
import DiaryEditor from "./DiaryEditor";

interface Props {
  onCancel: () => void;
}

const DiaryWrite = ({ onCancel }: Props) => {
  const [title, setTitle] = useState("");

  return (
    <div className="space-y-4">
      <input
        className="w-full rounded-lg border p-3"
        placeholder="제목을 입력하세요."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <DiaryEditor />

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border">
          취소
        </button>

        <button className="px-4 py-2 rounded-lg bg-primary text-white">
          저장
        </button>
      </div>
    </div>
  );
};

export default DiaryWrite;
