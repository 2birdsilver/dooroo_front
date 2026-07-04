export interface Diary {
  id: number;
  userId: number;
  spaceId: number;

  diaryDate: string; // "2026-06-30"
  title?: string; // 제목은 Nullable
  content: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
