import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import liff from '@line/liff';

export function useLiff() {
  const [liffObject, setLiffObject] = useState(null);
  const [liffError, setLiffError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_LIFF_ID_PROD 
          : process.env.NEXT_PUBLIC_LIFF_ID_DEV;

        await liff.init({ liffId });
        setLiffObject(liff);

        // LIFF経由でのアクセス時の自動リダイレクト
        if (liff.isInClient() && router.pathname === '/') {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get('redirect') || '/guest';
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error);
        setLiffError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, [router]);

  return { liff: liffObject, error: liffError, isLoading };
}