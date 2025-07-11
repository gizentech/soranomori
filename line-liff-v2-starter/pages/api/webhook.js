import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // LINE Webhook署名検証
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const body = JSON.stringify(req.body);
  const signature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  const expectedSignature = req.headers['x-line-signature'];

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Webhookイベント処理
  const events = req.body.events;
  
  events.forEach(event => {
    console.log('Webhook Event:', event);
    
    if (event.type === 'message' && event.message.type === 'text') {
      // テキストメッセージを受信した場合
      handleTextMessage(event);
    } else if (event.type === 'follow') {
      // 友だち追加された場合
      handleFollowEvent(event);
    }
  });

  res.status(200).json({ status: 'OK' });
}

async function handleTextMessage(event) {
  // メッセージ処理ロジック
  console.log('Text message received:', event.message.text);
}

async function handleFollowEvent(event) {
  // 友だち追加時の処理
  console.log('New follower:', event.source.userId);
}