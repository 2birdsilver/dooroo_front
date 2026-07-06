import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser } from "../api/user";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
}

const LoginPage = () => {
  const { login } = useAuth(); // Context에서 login 함수 가져오기

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // 이미 로그인한 상태라면 메인(/)으로 튕겨냄
  if (useAuth().isAuthenticated) return <Navigate to="/" replace />;

  /*
  테스트 로그인
  */
  const handleTestLoginSubmit = async () => {
    const data = await loginUser({
      email: "test@test",
      password: "test",
    });
    login(data.token, data.user, data.spaceId); // Context 로그인 함수 실행 -> 상태 저장 및 로컬스토리지 저장 일괄 처리
    navigate("/");
  };

  /*
진짜 로그인
  */
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = await loginUser({ email, password });
    // Context 로그인 함수 실행 -> 상태 저장 및 로컬스토리지 저장 일괄 처리
    login(data.token, data.user, data.spaceId);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form
        onSubmit={handleLoginSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-6 text-center">Dooroo 로그인</h2>

        {/* 이메일 입력 필드 */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={email} // 컴포넌트에 선언된 email 상태 변수와 연결
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 비밀번호 입력 필드 */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password} // 컴포넌트에 선언된 password 상태 변수와 연결
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 에러 메시지 표시 구역 (errorMessage 상태가 있을 때만 노출) */}
        {errorMessage && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* 진짜 로그인 제출 버튼 */}
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors mb-3"
        >
          로그인
        </button>

        {/* 기존 테스트 로그인 버튼 (type="button"으로 지정해서 폼 제출을 방지하고 별도 핸들러를 연결하는 것을 추천합니다) */}
        <button
          type="button"
          onClick={handleTestLoginSubmit}
          className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm text-center"
        >
          테스트 로그인 (클릭 시 진입 가능)
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
