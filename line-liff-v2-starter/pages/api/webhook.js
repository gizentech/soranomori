import crypto from 'crypto';

export default function handler(req, res) {
  console.log('Webhook received:', {
    method: req.method,
    headers: Object.keys(req.headers),
    bodyType: typeof req.body
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // LINE Webhook署名検証
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    console.error('LINE_CHANNEL_SECRET not configured');
    return res.status(500).json({ error: 'Channel secret not configured' });
  }

  const body = JSON.stringify(req.body);
  const signature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  const expectedSignature = req.headers['x-line-signature'];

  if (signature !== expectedSignature) {
    console.error('Invalid signature:', { signature, expectedSignature });
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Webhookイベント処理
  const events = req.body.events || [];
  
  events.forEach(event => {
    console.log('Webhook Event:', {
      type: event.type,
      userId: event.source?.userId ? `${event.source.userId.substring(0, 10)}...` : 'null',
      timestamp: event.timestamp
    });
    
    if (event.type === 'message' && event.message.type === 'text') {
      handleTextMessage(event);
    } else if (event.type === 'follow') {
      handleFollowEvent(event);
    }
  });

  res.status(200).json({ status: 'OK' });
}

async function handleTextMessage(event) {
  console.log('Text message received:', event.message.text);
  // 必要に応じてメッセージ処理ロジックを実装
}

async function handleFollowEvent(event) {
  console.log('New follower:', event.source.userId);
  // 友だち追加時の自動メッセージ送信などを実装
}