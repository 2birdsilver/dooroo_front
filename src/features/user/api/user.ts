import { UserInfo } from "../context/AuthContext";

// 💡 회원가입 요청 데이터 구조 정의
interface SignupData {
  email: string;
  password?: string; // 필요에 따라 선택적으로 설정하거나 필수 처리
  nickname: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

// 환경 변수 주소 가져오기
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USER_URL = `${BASE_URL}/api/users`;

const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "요청 처리 중 오류가 발생했습니다.");
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return {};
};

/**
 * 백엔드 서버에 회원가입을 요청하는 함수
 */
export const registerUser = async (signUpData: SignupData): Promise<void> => {
  const response = await fetch(`${USER_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signUpData),
  });
  return handleResponse(response);
};

// 백엔드 서버에 로그인 요청을 보내고 토큰을 반환하는 함수
export const loginUser = async (
  loginData: LoginData,
): Promise<{ token: string; user: UserInfo; spaceId: number }> => {
  const response = await fetch(`${USER_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  return handleResponse(response);
};
