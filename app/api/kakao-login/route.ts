import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { serialize } from "cookie";

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "잘못된 요청 방식입니다. POST 요청만 허용됩니다." },
      { status: 405 }
    );
  }
  const { code } = await req.json();

  // 1. 카카오 access_token 발급
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
      //client_secret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET!,
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

  const kakaoId = userData.id?.toString() ?? "";
  const nickname = userData.properties?.nickname ?? "";
  const profileImg = userData.properties?.profile_image ?? "";

  if (!userData.id) {
    return NextResponse.json(
      { error: "카카오 유저 정보 요청 실패" },
      { status: 400 }
    );
  }

  // 3. Supabase upsert (user 테이블에 맞게)
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("kakao_id", kakaoId)
    .single();

  if (!user) {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          kakao_id: kakaoId,
          nickname: nickname,
          profile_img: profileImg,
        },
      ])
      .select()
      .single();
    if (insertError) {
      return NextResponse.json(
        { error: "Supabase에 유저 정보 저장 실패", detail: insertError },
        { status: 500 }
      );
    }
    user = newUser;
  }

  // 3-1. JWT 토큰 생성
  const jwtToken = jwt.sign(
    {
      id: user.id,
      nickname: user.nickname,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "30d", // 30일 동안 유효
    }
  );
  // 3-2. JWT 토큰을 쿠키에 저장
  (await cookies()).set({
    name: "token",
    value: jwtToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일 (초 단위)
  });

  // 4. 결과 반환
  return NextResponse.json({ ok: true });
}
