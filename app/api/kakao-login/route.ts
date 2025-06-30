import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  // 1. 카카오 access_token 발급
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
      client_secret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET!,
      redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
      code,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.json(
      { error: "카카오 토큰 발급 실패" },
      { status: 400 }
    );
  }

  // 2. 카카오 유저 정보 조회
  const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const userData = await userRes.json();

  if (!userData.id) {
    return NextResponse.json(
      { error: "카카오 유저 정보 요청 실패" },
      { status: 400 }
    );
  }

  // 3. Supabase upsert (user 테이블에 맞게)
  const { error } = await supabase.from("user").upsert({
    user_id: userData.id,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json(
      { error: "Supabase 저장 실패", detail: error },
      { status: 500 }
    );
  }

  // 4. 결과 반환
  return NextResponse.json({
    user: {
      id: userData.id,
    },
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
  });
}
