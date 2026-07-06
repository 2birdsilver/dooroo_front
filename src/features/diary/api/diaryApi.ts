import { Diary } from "../types/diary";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DIARY_URL = `${BASE_URL}/api/diary`;

export interface DiaryRequestDto {
  userId: number;
  spaceId: number;
  diaryDate: string;
  title: string;
  content: string;
}

export const diaryApi = {
  // 1. Create (일기 등록)
  createDiary: async (requestData: DiaryRequestDto): Promise<Diary> => {
    const response = await fetch(DIARY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) throw new Error("일기 등록 실패");
    return response.json();
  },

  // 2. Read List (스페이스별 일기 목록 조회)
  getDiariesBySpace: async (spaceId: number): Promise<Diary[]> => {
    const response = await fetch(`${DIARY_URL}/space/${spaceId}`);
    if (!response.ok) throw new Error("일기 목록 조회 실패");
    return response.json();
  },

  // 월별 일기 작성여부 목록 조회
  getDiaryDatesByMonth: async (
    year: number,
    month: number,
    spaceId: number,
  ): Promise<string[]> => {
    const response = await fetch(
      `${DIARY_URL}/dates?year=${year}&month=${month}&spaceId=${spaceId}`,
    );
    if (!response.ok) throw new Error("일기 목록 조회 실패");
    return response.json();
  },

  // 각 스페이스에 따른 날짜별 일기 조회
  getDiaryByDate: async (spaceId: number, date: string): Promise<Diary> => {
    const response = await fetch(`${DIARY_URL}/space/${spaceId}/date/${date}`);
    if (!response.ok) throw new Error("날짜별 일기 조회 실패");
    return response.json();
  },

  // 3. Read Single (단건 상세 조회)
  getDiaryById: async (id: number): Promise<Diary> => {
    const response = await fetch(`${DIARY_URL}/${id}`);
    if (!response.ok) throw new Error("일기 상세 조회 실패");
    return response.json();
  },

  // 4. Update (일기 수정)
  updateDiary: async (
    id: number,
    requestData: DiaryRequestDto,
  ): Promise<Diary> => {
    const response = await fetch(`${DIARY_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) throw new Error("일기 수정 실패");
    return response.json();
  },

  // 5. Delete (소프트 삭제)
  deleteDiary: async (id: number): Promise<void> => {
    const response = await fetch(`${DIARY_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("일기 삭제 실패");
  },
};
