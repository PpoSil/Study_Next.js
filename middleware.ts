// 미들웨어를 사용하면 미들웨어가 인증을 확인할 때까지 보호된 경로가 렌더링을 시작하지 않아 애플리케이션의 보안과 성능이 모두 향상

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  // 특정 경로에서 실행되도록 지정
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
