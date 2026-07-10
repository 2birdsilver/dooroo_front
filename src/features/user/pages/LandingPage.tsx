import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../user/context/AuthContext";

const LandingPage = () => {
  // AuthContext에서 사용자 상태 가져오기
  const { user, spaceId } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <h1 className="text-5xl font-CloudsofaNamgim text-brown-800 mb-4">
        Dooroo
      </h1>
      <p className="text-slate-600 mb-8 max-w-md">
        나의 일상을 자유롭게 기록하고 보관해 보세요.
      </p>

      <div className="flex gap-4">
        {user ? (
          // 로그인 상태일 때
          <Link
            to={`/space/${spaceId}`} // 혹은 사용자의 메인 페이지 경로
            className="px-6 py-3 bg-brown-500 text-white font-medium rounded-xl shadow-md hover:bg-brown-300 transition-all"
          >
            내 스페이스 가기
          </Link>
        ) : (
          // 로그인하지 않았을 때
          <>
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 transition-all"
            >
              로그인하기
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 font-medium rounded-xl shadow-sm hover:bg-slate-100 transition-all"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
