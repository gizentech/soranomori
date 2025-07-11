import Head from "next/head";
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';
import { useRouter } from 'next/router';

export default function Home(props) {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>空の森クリニック - ゲスト支援システム</title>
      </Head>
      
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            空の森クリニック
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ゲスト支援システム
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              ゲストの方
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              認証番号をお持ちの方はこちら
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push('/guest')}
              sx={{ py: 1.5 }}
            >
              ゲストログイン
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              管理者の方
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ゲスト登録・管理画面
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push('/admin')}
              sx={{ py: 1.5 }}
            >
              管理者画面
            </Button>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}