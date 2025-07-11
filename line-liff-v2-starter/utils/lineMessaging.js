// utils/lineMessaging.js（新規作成）
export async function sendLineMessage(userId, messages) {
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
  
  return response.json();
}

// pages/api/send-message.js（新規作成）
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, messages } = req.body;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: userId,
        messages: messages
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('LINE API Error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}