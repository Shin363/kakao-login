"use client";

// env 값들은 NEXT_PUBLIC_ 접두사가 붙은 것만 클라이언트에서 접근 가능
const KAKAO_CLIENT_ID =
  process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || process.env.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
        marginTop: 64,
      }}
    >
      <h1>로그인</h1>
      <button
        onClick={handleLogin}
        style={{
          background: "#FEE500",
          border: "none",
          borderRadius: 8,
          padding: "12px 24px",
          fontWeight: "bold",
          color: "#181600",
          cursor: "pointer",
        }}
      >
        카카오로 로그인
      </button>
    </div>
  );
}
