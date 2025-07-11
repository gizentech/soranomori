import { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { generateUID } from '../../utils/generateUID';

export default function GuestRegistrationForm() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    birthDate: null,
    wifeFirstBloodDate: null,
    husbandFirstBloodDate: null,
    separateHusbandDate: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [guestUID, setGuestUID] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const uid = generateUID();
      
      const guestData = {
        uid: uid,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate?.toDate(),
        wifeFirstBloodDate: formData.wifeFirstBloodDate?.toDate(),
        husbandFirstBloodDate: formData.separateHusbandDate 
          ? formData.husbandFirstBloodDate?.toDate()
          : formData.wifeFirstBloodDate?.toDate(),
        createdAt: new Date(),
        isCompleted: false
      };

      await addDoc(collection(db, 'guests'), guestData);
      
      setGuestUID(uid);
      setMessage('ゲストが正常に登録されました！');
      
      // フォームリセット
      setFormData({
        phoneNumber: '',
        birthDate: null,
        wifeFirstBloodDate: null,
        husbandFirstBloodDate: null,
        separateHusbandDate: false
      });
      
    } catch (error) {
      console.error('Error:', error);
      setMessage('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ゲスト登録フォーム
          </Typography>
          
          {message && (
            <Alert severity={guestUID ? "success" : "error"} sx={{ mb: 2 }}>
              {message}
              {guestUID && (
                <Box sx={{ mt: 1 }}>
                  <strong>認証番号: {guestUID}</strong>
                </Box>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="電話番号"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                  placeholder="090-1234-5678"
                />
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="生年月日"
                  value={formData.birthDate}
                  onChange={(date) => handleInputChange('birthDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="妻）初回採血日"
                  value={formData.wifeFirstBloodDate}
                  onChange={(date) => handleInputChange('wifeFirstBloodDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.separateHusbandDate}
                      onChange={(e) => handleInputChange('separateHusbandDate', e.target.checked)}
                    />
                  }
                  label="夫の初回採血日を別日にする"
                />
              </Grid>

              {formData.separateHusbandDate && (
                <Grid item xs={12}>
                  <DatePicker
                    label="夫）初回採血日"
                    value={formData.husbandFirstBloodDate}
                    onChange={(date) => handleInputChange('husbandFirstBloodDate', date)}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'ゲスト登録'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}