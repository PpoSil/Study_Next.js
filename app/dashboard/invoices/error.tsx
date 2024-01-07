'use client';
// error는 클라이언트 구성 요소여야 함.

import { useEffect } from 'react';

export default function Error({
  error,  // js 기본 개체 인스턴스
  reset,  // 오류 경계 재설정 -> 실행되면 함수는 경로 세그먼트를 다시 랜더링하려고 시도.
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}
