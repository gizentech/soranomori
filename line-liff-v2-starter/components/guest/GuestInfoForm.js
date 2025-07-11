import { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { calculateAge, calculateMarriageAge } from '../../utils/dateUtils';
import DynamicForm from '../common/DynamicForm';

export default function GuestInfoForm({ guestData, liff }) {
  const [formData, setFormData] = useState({
    treatmentDesires: {},
    maritalStatus: '',
    marriageYear: '',
    wife: {
      birthDate: guestData.birthDate ? dayjs(guestData.birthDate).toDate() : null,
      gender: '妻',
      pregnancyHistory: 0,
      birthHistory: 0,
      holidays: []
    },
    husband: {
      gender: '夫',
      holidays: []
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const validateForm = () => {
    const errors = [];
    
    // 必須フィールドのチェック
    if (!formData.maritalStatus) {
      errors.push('婚姻状況を選択してください');
    }
    
    if (formData.maritalStatus === '既婚' && !formData.marriageYear) {
      errors.push('結婚した年を入力してください');
    }
    
    if (!formData.wife?.name) {
      errors.push('妻の氏名を入力してください');
    }
    
    if (!formData.wife?.nameKana) {
      errors.push('妻の氏名（カナ）を入力してください');
    }
    
    if (!formData.wife?.birthDate) {
      errors.push('妻の生年月日を入力してください');
    }
    
    if (!formData.husband?.name) {
      errors.push('夫の氏名を入力してください');
    }
    
    if (!formData.husband?.nameKana) {
      errors.push('夫の氏名（カナ）を入力してください');
    }
    
    if (!formData.husband?.birthDate) {
      errors.push('夫の生年月日を入力してください');
    }
    
    return errors;
  };

  const sendLineMessage = async (userId, messages) => {
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          messages
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    } catch (error) {
      console.error('Line message error:', error);
      throw error;
    }
  };

  const sendNotificationMessages = async (guestFormData) => {
    // 完了通知メッセージ
    const messages = [
      {
        type: 'text',
        text: `${guestFormData.wife.name}様\n\nご登録ありがとうございました！\n初診用フォームの入力が完了いたしました。`
      },
      {
        type: 'text',
        text: '📋 初回採血時の持ち物\n\n・マイナンバーカード（または保険証）\n・お薬手帳\n・基礎体温表（お持ちの場合）\n\n※忘れずにお持ちください'
      },
      {
        type: 'text',
        text: '🚗 アクセス・駐車場のご案内\n\nクリニック専用駐車場をご利用いただけます。\n満車の場合は近隣のコインパーキングをご利用ください。\n\n詳しい場所はクリニックまでお問い合わせください。'
      },
      {
        type: 'text',
        text: `⏰ 初回採血予定日\n\n${guestData.wifeFirstBloodDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        })}\n\n前日にリマインドメッセージをお送りいたします。`
      },
      {
        type: 'text',
        text: 'ご不明な点がございましたら、お気軽にクリニックまでお問い合わせください。\n\n空の森クリニック\nお電話: 0942-XXX-XXXX'
      }
    ];

    // LINEユーザーIDがある場合のみメッセージ送信
    if (guestData.lineUserId) {
      try {
        await sendLineMessage(guestData.lineUserId, messages);
        console.log('LINE通知メッセージを送信しました');
      } catch (error) {
        console.error('LINE通知送信エラー:', error);
        // エラーが発生してもフォーム送信は継続
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // バリデーション
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessage(`入力エラー: ${validationErrors.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      // 年齢計算
      const wifeAge = calculateAge(formData.wife.birthDate);
      const husbandAge = calculateAge(formData.husband.birthDate);
      
      // 結婚年齢計算
      let wifeMarriageAge = null;
      let husbandMarriageAge = null;
      
      if (formData.maritalStatus === '既婚' && formData.marriageYear) {
        wifeMarriageAge = calculateMarriageAge(formData.wife.birthDate, parseInt(formData.marriageYear));
        husbandMarriageAge = calculateMarriageAge(formData.husband.birthDate, parseInt(formData.marriageYear));
      }

      // Firestoreに保存するデータ
      const guestFormData = {
        guestId: guestData.uid,
        treatmentDesires: formData.treatmentDesires,
        maritalStatus: formData.maritalStatus,
        marriageYear: formData.marriageYear ? parseInt(formData.marriageYear) : null,
        wife: {
          ...formData.wife,
          age: wifeAge,
          marriageAge: wifeMarriageAge
        },
        husband: {
          ...formData.husband,
          age: husbandAge,
          marriageAge: husbandMarriageAge
        },
        submittedAt: new Date(),
        updatedAt: new Date()
      };

      // Firestoreに保存
      await addDoc(collection(db, 'guestForms'), guestFormData);
      
      // ゲストデータの完了フラグを更新
      await updateDoc(doc(db, 'guests', guestData.id), {
        isCompleted: true,
        completedAt: new Date()
      });

      // セッションストレージのゲストデータも更新
      const updatedGuestData = {
        ...guestData,
        isCompleted: true,
        completedAt: new Date().toISOString()
      };
      sessionStorage.setItem('guestData', JSON.stringify({
        ...updatedGuestData,
        birthDate: updatedGuestData.birthDate.toISOString(),
        wifeFirstBloodDate: updatedGuestData.wifeFirstBloodDate.toISOString(),
        husbandFirstBloodDate: updatedGuestData.husbandFirstBloodDate.toISOString()
      }));

      // 成功メッセージ表示
      setMessage('登録が完了しました！ご協力ありがとうございました。');
      
      // LINEに完了通知を送信
      await sendNotificationMessages(guestFormData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/guest/dashboard');
  };

  // 登録完了後の表示
  if (message.includes('完了')) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            🎉 入力完了
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            初診用フォームの入力が完了いたしました。<br/>
            注意事項やご案内をLINEメッセージでお送りしました。
          </Typography>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Typography variant="body2" color="primary.main">
              📅 初回採血予定日<br/>
              {guestData.wifeFirstBloodDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 3 }}>
            前日にリマインドメッセージをお送りします
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={handleGoToDashboard}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            ダッシュボードへ
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            初診用フォーム
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            以下の項目をご入力ください。必須項目は必ずご記入をお願いします。
          </Typography>
          
          {message && !message.includes('完了') && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <DynamicForm 
              formData={formData} 
              setFormData={setFormData}
            />

            {/* 送信ボタン */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  fontSize: '1.1rem',
                  minWidth: 200
                }}
              >
                {loading ? <CircularProgress size={24} /> : '登録完了'}
              </Button>
            </Box>
            
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ display: 'block', textAlign: 'center', mt: 2 }}
            >
              登録完了後、注意事項やご案内をメッセージでお送りします
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}