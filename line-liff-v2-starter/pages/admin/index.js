import { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import GuestRegistrationForm from '../../components/admin/GuestRegistrationForm';
import GuestList from '../../components/admin/GuestList';

export default function AdminDashboard() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          空の森クリニック - 管理者画面
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ゲスト登録・管理システム
        </Typography>
      </Box>
      
      <GuestRegistrationForm />
      <GuestList />
    </Container>
  );
}