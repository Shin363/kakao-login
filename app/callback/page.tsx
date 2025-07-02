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
        credentials: "include", // 쿠키에 JWT가 자동 저장됨
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            alert("로그인 성공!");
            router.replace("/"); // 홈으로 이동
            return;
          } else if (data.error) {
            alert("로그인 실패: " + data.error);
            router.replace("/login");
          }
        });
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div style={{ padding: 48, textAlign: "center" }}>로그인 처리 중...</div>
  );
}
