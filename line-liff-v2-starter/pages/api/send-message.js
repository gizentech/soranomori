import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, messages } = req.body;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  console.log('LINE Message API Request:', {
    userId: userId ? `${userId.substring(0, 10)}...` : 'null',
    messageCount: messages?.length || 0,
    hasAccessToken: !!accessToken
  });

  if (!accessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN not configured');
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN not configured' });
  }

  if (!userId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  try {
    const response = await axios.post(
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

    console.log('LINE Message sent successfully:', response.status);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('LINE API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.response?.data || error.message
    });
  }
}