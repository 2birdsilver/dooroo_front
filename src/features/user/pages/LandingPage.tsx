import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">
        나만의 감성 일기장, My Space 📖
      </h1>
      <p className="text-slate-600 mb-8 max-w-md">
        오늘 하루 있었던 소중한 일들을 달력과 Tiptap 에디터로 자유롭게 기록하고
        보관해 보세요.
      </p>

      <div className="flex gap-4">
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
      </div>
    </div>
  );
};

export default LandingPage;
