import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 1. 유저 정보 타입 정의 (프로젝트 구조에 맞게 수정 가능)
export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
}

// 2. Context가 제공할 데이터와 함수의 타입 정의
interface AuthContextType {
  user: UserInfo | null; // 로그인된 유저 정보 (로그아웃 상태면 null)
  token: string | null; // JWT 토큰
  spaceId: number | null; // 로그인 시점에 저장된 스페이스 ID
  isAuthenticated: boolean; // 로그인 여부 (true/false)
  login: (token: string, userInfo: UserInfo, spaceId: number) => void; // 로그인 함수
  logout: () => void; // 로그아웃 함수
  isLoading: boolean; // 로컬스토리지 확인 중인지 여부 (깜빡임 방지)
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. 앱을 감싸줄 Provider 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [spaceId, setSpaceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 브라우저가 켜질 때(혹은 새로고침 시) 로컬스토리지에서 기존 로그인 정보 복구
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedSpaceId = localStorage.getItem("spaceId");

    if (savedToken && savedUser && savedSpaceId) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setSpaceId(parseInt(savedSpaceId));
    }
    setIsLoading(false); // 로딩 완료
  }, []);

  // 로그인 성공 시 실행할 함수
  const login = (newToken: string, userInfo: UserInfo, spaceId: number) => {
    setToken(newToken);
    setUser(userInfo);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userInfo));
    localStorage.setItem("spaceId", String(spaceId)); // 로그인 시점에 스페이스 ID 저장
  };

  // 로그아웃 시 실행할 함수
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("spaceId");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        spaceId,
        isAuthenticated: !!user, // user 객체가 존재하면 true, 없으면 false
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 4. 다른 컴포넌트에서 Context를 쉽게 꺼내 쓰기 위한 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
};
