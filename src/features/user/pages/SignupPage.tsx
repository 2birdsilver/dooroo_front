import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/user"; // 💡 분리한 API 함수 불러오기 (경로는 프로젝트 구조에 맞게 조절하세요)

const SignupPage = () => {
  const navigate = useNavigate();

  // 입력 필드 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");

  // 에러 메시지 상태
  const [errorMessage, setErrorMessage] = useState("");

  // 회원가입 제출 핸들러
  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    // 비밀번호 검증
    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 💡 분리해 둔 API 로직 호출
      await registerUser({ email, password, nickname });

      alert("회원가입이 완료되었습니다! 로그인해 주세요.");
      navigate("/login");
    } catch (error: any) {
      setErrorMessage(error.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  // 💡 아래 return 부분을 추가해 주시면 됩니다!
  return (
    <div
      className="signup-container"
      style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}
    >
      <h2>회원가입</h2>

      <form onSubmit={handleSignupSubmit}>
        {/* 이메일 입력 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "5px" }}
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 닉네임 입력 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="nickname"
            style={{ display: "block", marginBottom: "5px" }}
          >
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "5px" }}
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 비밀번호 확인 입력 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="confirmPassword"
            style={{ display: "block", marginBottom: "5px" }}
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 에러 메시지 표시 (있을 때만 렌더링) */}
        {errorMessage && (
          <div style={{ color: "red", marginBottom: "15px", fontSize: "14px" }}>
            {errorMessage}
          </div>
        )}

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          회원가입하기
        </button>
      </form>

      {/* 로그인 페이지 이동 링크 */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </div>
    </div>
  );
};

export default SignupPage;
