"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      fetch("/api/kakao-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert("로그인 실패: " + data.error);
            router.replace("/login");
            return;
          }
          // 토큰/유저정보 등 저장
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("user_id", data.user.id);
          // 필요에 따라 상태관리 추가

          router.replace("/"); // 홈으로 이동
        });
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div style={{ padding: 48, textAlign: "center" }}>로그인 처리 중...</div>
  );
}
