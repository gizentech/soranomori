import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Box
} from '@mui/material';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function GuestList() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const q = query(collection(db, 'guests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const guestList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setGuests(guestList);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('ja-JP');
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          登録済みゲスト一覧
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>UID</TableCell>
                <TableCell>電話番号</TableCell>
                <TableCell>生年月日</TableCell>
                <TableCell>初回採血日</TableCell>
                <TableCell>LINE連携</TableCell>
                <TableCell>ステータス</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {guest.uid}
                    </Typography>
                  </TableCell>
                  <TableCell>{guest.phoneNumber}</TableCell>
                  <TableCell>{formatDate(guest.birthDate)}</TableCell>
                  <TableCell>{formatDate(guest.wifeFirstBloodDate)}</TableCell>
                  <TableCell>
                    {guest.lineUserId ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={guest.linePictureUrl} 
                          sx={{ width: 24, height: 24 }}
                        />
                        <Chip 
                          label="連携済み" 
                          color="success" 
                          size="small"
                        />
                      </Box>
                    ) : (
                      <Chip label="未連携" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={guest.isCompleted ? "入力完了" : "入力待ち"}
                      color={guest.isCompleted ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}