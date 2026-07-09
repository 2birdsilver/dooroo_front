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
  getDiariesBySpace: async (spaceId: number): Promise<Diary | null> => {
    const response = await fetch(`${DIARY_URL}/space/${spaceId}`);
    // 1. 일기가 없는 날 204 No Content로 응답하는 백엔드를 위한 처리
    if (response.status === 204) return null;

    if (!response.ok) throw new Error("날짜별 일기 조회 실패");

    // 2. 응답 본문이 비어있는지 텍스트로 먼저 확인 후 처리 (가장 안전함)
    const text = await response.text();
    if (!text) return null;

    console.log("날짜별 일기 조회 응답 본문:", text);

    return JSON.parse(text);
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
  getDiaryByDate: async (
    spaceId: number,
    date: string,
  ): Promise<Diary | null> => {
    const response = await fetch(`${DIARY_URL}/space/${spaceId}/date/${date}`);

    if (!response.ok) throw new Error("날짜별 일기 조회 실패");

    // 1. response.json() 대신 text()로 본문을 '딱 한 번만' 읽습니다.
    const resText = await response.text();

    // 2. 본문이 완전히 비어있거나 공백만 있다면 일기가 없는 것이므로 null 반환
    if (!resText || resText.trim() === "") {
      return null;
    }

    // 3. 내용이 있을 때만 안전하게 JSON 객체로 변환하여 리턴합니다.
    return JSON.parse(resText);
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
