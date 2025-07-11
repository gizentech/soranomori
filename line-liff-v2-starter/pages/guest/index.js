import { useState, useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import AuthForm from '../../components/guest/AuthForm';
import { useRouter } from 'next/router';

export default function GuestLogin({ liff }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestData, setGuestData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (liff && liff.isLoggedIn()) {
      console.log('LIFFにログイン済み');
    }
  }, [liff]);

  const handleAuthSuccess = (data) => {
    setIsAuthenticated(true);
    setGuestData(data);
    // フォーム画面に遷移
    router.push('/guest/form');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          空の森クリニック
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ゲスト支援システム
        </Typography>
      </Box>

      <AuthForm onAuthSuccess={handleAuthSuccess} liff={liff} />
    </Container>
  );
}