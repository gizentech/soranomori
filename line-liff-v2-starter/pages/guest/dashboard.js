import { useState, useEffect } from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import { 
  Home, 
  CalendarToday, 
  Notifications, 
  Person, 
  Settings,
  Event,
  LocalHospital,
  Phone,
  Email,
  Edit
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { calculateDaysUntilBloodTest } from '../../utils/dateUtils';

export default function Dashboard({ liff }) {
  const [value, setValue] = useState(0);
  const [guestData, setGuestData] = useState(null);
  const [lineUser, setLineUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // セッションストレージからゲストデータを取得
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

    // LINEユーザー情報を取得
    if (liff && liff.isLoggedIn()) {
      liff.getProfile().then(profile => {
        setLineUser(profile);
      }).catch(error => {
        console.error('Profile fetch error:', error);
      });
    }
  }, [router, liff]);

  const navigationItems = [
    { label: 'ホーム', icon: <Home /> },
    { label: '予約', icon: <CalendarToday /> },
    { label: 'お知らせ', icon: <Notifications /> },
    { label: 'プロフィール', icon: <Person /> },
    { label: '設定', icon: <Settings /> }
  ];

  const renderHomeContent = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        {lineUser && (
          <Box sx={{ mb: 2 }}>
            <Avatar
              src={lineUser.pictureUrl}
              sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }}
            />
            <Typography variant="h6">
              {lineUser.displayName}さん
            </Typography>
          </Box>
        )}
        <Typography variant="h5" gutterBottom>
          空の森クリニック
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ゲスト支援システム
        </Typography>
      </Box>

      {guestData && (
        <Grid container spacing={2}>
          {/* ゲスト情報カード */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ゲスト情報
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ゲストID
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {guestData.uid}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    登録状況
                  </Typography>
                  <Chip 
                    label={guestData.isCompleted ? "入力完了" : "入力待ち"}
                    color={guestData.isCompleted ? "success" : "warning"}
                    size="small"
                  />
                </Box>
                {guestData.wifeFirstBloodDate && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                      📅 初回採血予定日
                    </Typography>
                    <Typography variant="body1">
                      {guestData.wifeFirstBloodDate.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </Typography>
                    {calculateDaysUntilBloodTest(guestData.wifeFirstBloodDate) && (
                      <Typography variant="body2" color="primary.main">
                        {calculateDaysUntilBloodTest(guestData.wifeFirstBloodDate)}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* クイックアクション */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  クイックアクション
                </Typography>
                <List dense>
                  {!guestData.isCompleted && (
                    <ListItem 
                      button 
                      onClick={() => router.push('/guest/form')}
                      sx={{ borderRadius: 1, mb: 1, bgcolor: 'action.hover' }}
                    >
                      <ListItemIcon>
                        <Edit color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="初診フォーム入力"
                        secondary="まだ入力が完了していません"
                      />
                    </ListItem>
                  )}
                  <ListItem button sx={{ borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Event />
                    </ListItemIcon>
                    <ListItemText 
                      primary="予約確認"
                      secondary="次回の予約を確認"
                    />
                  </ListItem>
                  <ListItem button sx={{ borderRadius: 1 }}>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText 
                      primary="クリニックに連絡"
                      secondary="お問い合わせ・相談"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* お知らせ */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  最新のお知らせ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  新しいお知らせはありません
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );

  const renderReservationContent = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        予約管理
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            次回予約
          </Typography>
          {guestData?.wifeFirstBloodDate && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                初回採血
              </Typography>
              <Typography variant="h6">
                {guestData.wifeFirstBloodDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                })}
              </Typography>
              <Typography variant="body2" color="primary.main">
                {calculateDaysUntilBloodTest(guestData.wifeFirstBloodDate) || ''}
              </Typography>
            </Box>
          )}
          <Button variant="outlined" fullWidth>
            予約の変更・キャンセル
          </Button>
        </CardContent>
      </Card>
    </Container>
  );

  const renderNotificationContent = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        お知らせ
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            新しいお知らせはありません
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );

  const renderProfileContent = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        プロフィール
      </Typography>
      
      {lineUser && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={lineUser.pictureUrl}
                sx={{ width: 56, height: 56, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">
                  {lineUser.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  LINE連携済み
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {guestData && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              登録情報
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="ゲストID"
                  secondary={guestData.uid}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="電話番号"
                  secondary={guestData.phoneNumber || '未登録'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="生年月日"
                  secondary={guestData.birthDate?.toLocaleDateString('ja-JP') || '未登録'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="登録状況"
                  secondary={
                    <Chip 
                      label={guestData.isCompleted ? "入力完了" : "入力待ち"}
                      color={guestData.isCompleted ? "success" : "warning"}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              情報変更申請
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );

  const renderSettingsContent = () => (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        設定
      </Typography>
      <Card>
        <CardContent>
          <List>
            <ListItem button>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText 
                primary="通知設定"
                secondary="LINEメッセージの受信設定"
              />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemIcon>
                <LocalHospital />
              </ListItemIcon>
              <ListItemText 
                primary="クリニック情報"
                secondary="連絡先・アクセス情報"
              />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => {
              sessionStorage.removeItem('guestData');
              router.push('/guest');
            }}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText 
                primary="ログアウト"
                secondary="アカウントからログアウト"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );

  const renderContent = () => {
    switch (value) {
      case 0:
        return renderHomeContent();
      case 1:
        return renderReservationContent();
      case 2:
        return renderNotificationContent();
      case 3:
        return renderProfileContent();
      case 4:
        return renderSettingsContent();
      default:
        return renderHomeContent();
    }
  };

  if (!guestData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 7 }}>
      {/* メインコンテンツ */}
      {renderContent()}
      
      {/* ボトムナビゲーション */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation 
          value={value} 
          onChange={(event, newValue) => setValue(newValue)}
          showLabels
        >
          {navigationItems.map((item, index) => (
            <BottomNavigationAction
              key={index}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}