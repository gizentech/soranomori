import { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import GuestInfoForm from '../../components/guest/GuestInfoForm';
import { useRouter } from 'next/router';
import { calculateDaysUntilBloodTest } from '../../utils/dateUtils';

export default function GuestForm({ liff }) {
  const [guestData, setGuestData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('guestData');
    if (!storedData) {
      router.push('/guest');
      return;
    }
    
    const parsedData = JSON.parse(storedData);
    
    // 日付文字列を Date オブジェクトに変換
    if (parsedData.birthDate) {
      parsedData.birthDate = new Date(parsedData.birthDate);
    }
    if (parsedData.wifeFirstBloodDate) {
      parsedData.wifeFirstBloodDate = new Date(parsedData.wifeFirstBloodDate);
    }
    if (parsedData.husbandFirstBloodDate) {
      parsedData.husbandFirstBloodDate = new Date(parsedData.husbandFirstBloodDate);
    }
    
    setGuestData(parsedData);
  }, [router]);

  if (!guestData) return null;

  const daysUntilBloodTest = calculateDaysUntilBloodTest(guestData.wifeFirstBloodDate);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 1 }}>
          ゲストID: {guestData.uid || '--'}
        </Typography>
        {daysUntilBloodTest && (
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'primary.main' }}>
            初回採血{guestData.wifeFirstBloodDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}まで{daysUntilBloodTest}
          </Typography>
        )}
      </Paper>

      <GuestInfoForm guestData={guestData} liff={liff} />
    </Container>
  );
}