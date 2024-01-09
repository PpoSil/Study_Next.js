import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },

  // 사용자가 로그인하지 않으면 대시보드 페이지에 액세스할 수 없음
  // callbacks: 요청이 Next.js 미들웨어를 authorized 통해 페이지에 액세스할 수 있는 권한이 있는지 확인
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  // providers: 다양한 로그인 옵션을 나열
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
