import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Avatar
} from '@mui/material';
import { PersonAdd, Login } from '@mui/icons-material';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import dayjs from 'dayjs';

export default function AuthForm({ onAuthSuccess, liff }) {
  const [authCode, setAuthCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lineUser, setLineUser] = useState(null);
  const [linkedGuest, setLinkedGuest] = useState(null);
  const [autoLoginChecking, setAutoLoginChecking] = useState(true);

  // useCallback で checkAutoLogin をメモ化
  const checkAutoLogin = useCallback(async () => {
    if (!liff || !liff.isLoggedIn()) {
      setAutoLoginChecking(false);
      return;
    }

    try {
      // LINEユーザー情報を取得
      const profile = await liff.getProfile();
      setLineUser(profile);

      // LINEユーザーIDで既存の連携を確認
      const q = query(
        collection(db, 'guests'),
        where('lineUserId', '==', profile.userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // 既存の連携がある場合は自動ログイン
        const guestDoc = querySnapshot.docs[0];
        const guestData = { id: guestDoc.id, ...guestDoc.data() };
        
        // Timestampを日付オブジェクトに変換
        if (guestData.birthDate?.toDate) {
          guestData.birthDate = guestData.birthDate.toDate();
        }
        if (guestData.wifeFirstBloodDate?.toDate) {
          guestData.wifeFirstBloodDate = guestData.wifeFirstBloodDate.toDate();
        }
        if (guestData.husbandFirstBloodDate?.toDate) {
          guestData.husbandFirstBloodDate = guestData.husbandFirstBloodDate.toDate();
        }

        setLinkedGuest(guestData);
        
        // セッションストレージに保存
        sessionStorage.setItem('guestData', JSON.stringify({
          ...guestData,
          birthDate: guestData.birthDate.toISOString(),
          wifeFirstBloodDate: guestData.wifeFirstBloodDate.toISOString(),
          husbandFirstBloodDate: guestData.husbandFirstBloodDate.toISOString()
        }));
        
        console.log('自動ログイン成功:', guestData);
      }
    } catch (error) {
      console.error('Auto login check error:', error);
    } finally {
      setAutoLoginChecking(false);
    }
  }, [liff]);

  useEffect(() => {
    checkAutoLogin();
  }, [checkAutoLogin]);

  const handleAutoLogin = () => {
    if (linkedGuest) {
      onAuthSuccess(linkedGuest);
    }
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('手動認証開始:', { authCode, birthDate });

      // まずUIDで検索
      const q = query(
        collection(db, 'guests'),
        where('uid', '==', authCode)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('認証番号が見つかりません。');
        return;
      }

      // UIDが一致するドキュメントを取得
      let matchedGuest = null;
      const inputDateFormatted = dayjs(birthDate).format('YYYY-MM-DD');
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        let guestBirthDate;
        
        // Firestoreのタイムスタンプを日付に変換
        if (data.birthDate?.toDate) {
          guestBirthDate = dayjs(data.birthDate.toDate()).format('YYYY-MM-DD');
        } else if (data.birthDate) {
          guestBirthDate = dayjs(data.birthDate).format('YYYY-MM-DD');
        }
        
        // 生年月日が一致するかチェック
        if (inputDateFormatted === guestBirthDate) {
          matchedGuest = { id: doc.id, ...data };
        }
      });

      if (!matchedGuest) {
        setError('生年月日が一致しません。正しい生年月日を入力してください。');
        return;
      }

      // LINEユーザーと連携
      if (liff && liff.isLoggedIn() && lineUser) {
        try {
          await updateDoc(doc(db, 'guests', matchedGuest.id), {
            lineUserId: lineUser.userId,
            lineDisplayName: lineUser.displayName,
            linePictureUrl: lineUser.pictureUrl,
            linkedAt: new Date()
          });
          
          matchedGuest.lineUserId = lineUser.userId;
          matchedGuest.lineDisplayName = lineUser.displayName;
          matchedGuest.linePictureUrl = lineUser.pictureUrl;
          
          console.log('LINEユーザーと連携しました');
        } catch (linkError) {
          console.error('LINE連携エラー:', linkError);
          // 連携エラーでも認証は続行
        }
      }

      // Timestampを日付オブジェクトに変換
      if (matchedGuest.birthDate?.toDate) {
        matchedGuest.birthDate = matchedGuest.birthDate.toDate();
      }
      if (matchedGuest.wifeFirstBloodDate?.toDate) {
        matchedGuest.wifeFirstBloodDate = matchedGuest.wifeFirstBloodDate.toDate();
      }
      if (matchedGuest.husbandFirstBloodDate?.toDate) {
        matchedGuest.husbandFirstBloodDate = matchedGuest.husbandFirstBloodDate.toDate();
      }
      
      console.log('認証成功:', matchedGuest);
      
      // セッションストレージに保存
      sessionStorage.setItem('guestData', JSON.stringify({
        ...matchedGuest,
        birthDate: matchedGuest.birthDate.toISOString(),
        wifeFirstBloodDate: matchedGuest.wifeFirstBloodDate.toISOString(),
        husbandFirstBloodDate: matchedGuest.husbandFirstBloodDate.toISOString()
      }));
      
      onAuthSuccess(matchedGuest);
      
    } catch (error) {
      console.error('Authentication error:', error);
      setError('認証に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (autoLoginChecking) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            アカウント確認中...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 自動ログイン可能な場合
  if (linkedGuest && lineUser) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              src={lineUser.pictureUrl}
              sx={{ width: 64, height: 64, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h6">
              おかえりなさい
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {lineUser.displayName}さん
            </Typography>
          </Box>

          <Alert severity="success" sx={{ mb: 3 }}>
            ゲストID: {linkedGuest.uid} と連携済みです
          </Alert>

          <Button
            variant="contained"
            fullWidth
            onClick={handleAutoLogin}
            startIcon={<Login />}
            sx={{ py: 1.5, mb: 2 }}
          >
            続行する
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              または
            </Typography>
          </Divider>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            別のゲストIDで認証する場合は下記フォームをご利用ください
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 手動認証フォーム
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          認証
        </Typography>
        
        {lineUser && (
          <Box sx={{ textAlign: 'center', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Avatar
              src={lineUser.pictureUrl}
              sx={{ width: 48, height: 48, mx: 'auto', mb: 1 }}
            />
            <Typography variant="body2">
              {lineUser.displayName}さんとしてログイン中
            </Typography>
            <Typography variant="caption" color="text.secondary">
              認証後、このLINEアカウントと連携されます
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          クリニックからお渡しした認証番号と生年月日を入力してください
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleManualAuth}>
          <TextField
            fullWidth
            label="認証番号"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
            required
            sx={{ mb: 2 }}
            placeholder="L494962"
            inputProps={{ maxLength: 7 }}
            helperText="英字1文字 + 数字6桁（例：L494962）"
          />

          <TextField
            fullWidth
            label="生年月日"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputLabelProps={{ shrink: true }}
            helperText="登録時の生年月日と同じ日付を入力してください"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={lineUser ? <PersonAdd /> : <Login />}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 
             lineUser ? 'アカウント連携してログイン' : 'ログイン'}
          </Button>
        </Box>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ※ 認証番号をお忘れの場合は、クリニックまでお問い合わせください<br/>
            ※ 一度連携すると次回から自動ログインできます
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}