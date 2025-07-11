import "../styles/globals.css";
import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
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

  useEffect(() => {
    console.log("LIFF初期化開始...");
    console.log("LIFF_ID:", process.env.LIFF_ID);
    console.log("現在のURL:", window.location.href);
    console.log("User Agent:", navigator.userAgent);
    
    liff
      .init({ liffId: process.env.LIFF_ID })
      .then(() => {
        console.log("LIFF初期化成功");
        console.log("LIFFバージョン:", liff.getVersion());
        console.log("LINEアプリ内:", liff.isInClient());
        console.log("ログイン状態:", liff.isLoggedIn());
        
        if (liff.isLoggedIn()) {
          liff.getProfile().then(profile => {
            console.log("ユーザープロフィール:", profile);
          }).catch(profileError => {
            console.error("プロフィール取得エラー:", profileError);
          });
        }
        
        setLiffObject(liff);
      })
      .catch((error) => {
        console.error("LIFF初期化エラー:", error);
        console.error("エラー詳細:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setLiffError(error.toString());
      });
  }, []);

  pageProps.liff = liffObject;
  pageProps.liffError = liffError;
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;