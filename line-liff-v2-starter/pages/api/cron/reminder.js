// pages/api/cron/reminder.js（新規作成）
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default async function handler(req, res) {
  // 明日が初回採血日のゲストを検索
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  try {
    const q = query(
      collection(db, 'guests'),
      where('wifeFirstBloodDate', '>=', tomorrow),
      where('wifeFirstBloodDate', '<=', tomorrowEnd),
      where('isCompleted', '==', true)
    );

    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const guestData = doc.data();
      
      if (guestData.lineUserId) {
        const reminderMessage = {
          type: 'text',
          text: `${guestData.lineDisplayName || 'ゲスト'}様\n\n明日は初回採血日です。\n\n📋 持ち物をご確認ください\n・マイナンバーカード\n・お薬手帳\n\nお気をつけてお越しください。`
        };

        await sendLineMessage(guestData.lineUserId, [reminderMessage]);
      }
    }

    res.status(200).json({ success: true, count: querySnapshot.size });
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
}