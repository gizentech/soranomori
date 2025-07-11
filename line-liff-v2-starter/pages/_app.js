import "../styles/globals.css";
import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useRouter } from 'next/router';
import liff from "@line/liff";

const theme = createTheme({
  palette: {
    primary: {
      main: '#06C755',
      light: '#42D77D',
      dark: '#058D3F',
    },
  },
});

function MyApp({ Component, pageProps }) {
  const [liffObject, setLiffObject] = useState(null);
  const [liffError, setLiffError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("LIFF初期化開始...");
    console.log("LIFF_ID:", process.env.LIFF_ID);
    console.log("現在のURL:", typeof window !== 'undefined' ? window.location.href : 'SSR');
    console.log("User Agent:", typeof window !== 'undefined' ? navigator.userAgent : 'SSR');
    
    const initLiff = async () => {
      try {
        // 環境変数から LIFF_ID を取得
        const liffId = process.env.LIFF_ID;
        
        if (!liffId) {
          throw new Error('LIFF_ID が設定されていません');
        }

        await liff.init({ liffId });
        
        console.log("LIFF初期化成功");
        console.log("LIFFバージョン:", liff.getVersion());
        console.log("LINEアプリ内:", liff.isInClient());
        console.log("ログイン状態:", liff.isLoggedIn());
        
        if (liff.isLoggedIn()) {
          try {
            const profile = await liff.getProfile();
            console.log("ユーザープロフィール:", profile);
          } catch (profileError) {
            console.error("プロフィール取得エラー:", profileError);
          }
        }
        
        setLiffObject(liff);

        // LIFF経由でのアクセス時の自動リダイレクト
        if (liff.isInClient() && router.pathname === '/') {
          console.log("LINEアプリ内からのアクセス検出 - ゲスト画面へリダイレクト");
          router.push('/guest');
        }
        
      } catch (error) {
        console.error("LIFF初期化エラー:", error);
        console.error("エラー詳細:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setLiffError(error.toString());
      } finally {
        setIsInitializing(false);
      }
    };

    initLiff();
  }, [router]);

  pageProps.liff = liffObject;
  pageProps.liffError = liffError;
  pageProps.isInitializing = isInitializing;
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;