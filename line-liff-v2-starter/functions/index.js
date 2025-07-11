const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

initializeApp();

// Firestore インスタンス
const db = getFirestore();

// リマインダー機能のHTTPS関数
exports.sendReminders = onRequest(async (req, res) => {
  try {
    // 明日が初回採血日のゲストを検索
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const guestsRef = db.collection("guests");
    const snapshot = await guestsRef
      .where("wifeFirstBloodDate", ">=", tomorrow)
      .where("wifeFirstBloodDate", "<=", tomorrowEnd)
      .where("isCompleted", "==", true)
      .get();

    const reminders = [];
    snapshot.forEach((doc) => {
      const guestData = doc.data();
      if (guestData.lineUserId) {
        reminders.push({
          userId: guestData.lineUserId,
          name: guestData.lineDisplayName || "ゲスト",
        });
      }
    });

    logger.info(`Found ${reminders.length} guests for reminder`);

    // LINE Message API で通知を送信
    for (const reminder of reminders) {
      await sendLineReminder(reminder.userId, reminder.name);
    }

    res.status(200).json({
      success: true,
      count: reminders.length,
    });
  } catch (error) {
    logger.error("Reminder error:", error);
    res.status(500).json({error: "Failed to send reminders"});
  }
});

// LINE リマインダーメッセージ送信
async function sendLineReminder(userId, userName) {
  const axios = require("axios");
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  const message = {
    type: "text",
    text: `${userName}様\n\n明日は初回採血日です。\n\n📋 持ち物をご確認ください\n・マイナンバーカード\n・お薬手帳\n\nお気をつけてお越しください。`,
  };

  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: userId,
        messages: [message],
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    logger.info(`Reminder sent to ${userId}`);
  } catch (error) {
    logger.error(`Failed to send reminder to ${userId}:`, error);
  }
}

// Webhook 処理
exports.webhook = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  const events = req.body.events || [];

  events.forEach((event) => {
    logger.info("Webhook Event:", {
      type: event.type,
      userId: event.source?.userId,
    });

    if (event.type === "message" && event.message.type === "text") {
      handleTextMessage(event);
    } else if (event.type === "follow") {
      handleFollowEvent(event);
    }
  });

  res.status(200).json({status: "OK"});
});

// テキストメッセージ処理
function handleTextMessage(event) {
  logger.info("Text message received:", event.message.text);
}

// フォローイベント処理
function handleFollowEvent(event) {
  logger.info("New follower:", event.source.userId);
}