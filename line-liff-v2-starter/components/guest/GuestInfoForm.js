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

      setMessage('登録が完了しました！ご協力ありがとうございました。');
      
      // LIFFでメッセージを送信（注意事項など）
      if (liff && liff.isLoggedIn()) {
        try {
          // 注意事項メッセージの送信
          await sendNotificationMessages(guestFormData);
        } catch (error) {
          console.error('メッセージ送信エラー:', error);
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      setMessage('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationMessages = async (guestFormData) => {
    // 注意事項のメッセージテンプレート
    const messages = [
      {
        type: 'text',
        text: `${guestFormData.wife.name}様\n\n初診のご登録をありがとうございました。\n\n以下の点にご注意ください：`
      },
      {
        type: 'text',
        text: '📋 必要な持ち物\n・マイナンバーカード（保険証）\n・お薬手帳\n・基礎体温表（お持ちの場合）'
      },
      {
        type: 'text',
        text: '🚗 駐車場のご案内\nクリニック専用駐車場をご利用いただけます。満車の場合は近隣のコインパーキングをご利用ください。'
      },
      {
        type: 'text',
        text: `⏰ 初回採血予定日\n${new Date(guestData.wifeFirstBloodDate).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}\n\n前日にリマインドメッセージをお送りします。`
      }
    ];

    // LIFF Messaging APIを使用してメッセージ送信
    // 実際の実装では適切なAPIエンドポイントを使用
    console.log('送信予定メッセージ:', messages);
  };

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
          
          {message && (
            <Alert 
              severity={message.includes('完了') ? "success" : "error"} 
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
                {loading ? <CircularProgress size={24} /> : '登録'}
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