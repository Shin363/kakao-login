# kakao-login

next.js와 supabase로 카카오 로그인 구현
쿠키 : 브라우저 저장 공간
JWT토큰 : 암호화된 문자열

1. 로그인 버튼 → 카카오 인증 페이지 이동

2. 카카오 인증 성공 → redirect_uri(env파일에 NEXT_PUBLIC_KAKAO_REDIRECT_URI에 저장되어 있음)로 code 받음
   NEXT_PUBLIC_KAKAO_REDIRECT_URI은 콜백 페이지임.

3. 콜백 페이지에서 code를 우리 API로 POST

4. API에서 카카오 엑세스토큰 획득 → 카카오 유저정보 조회 → 회원 조회/생성 → JWT 발급

5. JWT를 쿠키(HttpOnly)에 저장 → 로그인 세션 완성

6. 이후 인증이 필요한 API는 쿠키로 자동 인증됨

참고 했던 자료 : https://euni8917.tistory.com/575
