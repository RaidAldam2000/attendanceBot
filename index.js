const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

// إنشاء البوت مع Intents المطلوبة
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// مسار ملف الحضور
const dataFile = path.join(__dirname, "attendance.json");

// تحميل بيانات سابقة إذا موجودة
let attendance = {};
if (fs.existsSync(dataFile)) {
  const rawData = fs.readFileSync(dataFile);
  attendance = JSON.parse(rawData);
}

// حفظ البيانات في الملف
function saveAttendance() {
  fs.writeFileSync(dataFile, JSON.stringify(attendance, null, 2));
}

// عند تشغيل البوت
client.once("clientReady", () => {
  console.log("Bot is running");
});

// التعامل مع الرسائل
client.on("messageCreate", message => {
  if (message.author.bot) return;

  // لوج لتأكيد القراءة
  console.log(`Message received in channel: "${message.channel.name}" from "${message.author.username}"`);

  // روم الحضور فقط
  if (!message.channel.name.includes("الحضور")) return;

  const userId = message.author.id;
  const now = new Date();

  // تسجيل الدخول
  if (message.content.toUpperCase() === "د") {
    if (attendance[userId] && attendance[userId].inTime) {
      return message.reply("❌ أنت مسجل دخول بالفعل");
    }

    attendance[userId] = {
      username: message.author.username,
      inTime: now
    };

    saveAttendance();

    message.reply(
      `✅ تم تسجيل الدخول
👤 الاسم: ${message.author.username}
🕒 الوقت: ${now.toLocaleTimeString()}`
    );
  }

  // تسجيل الخروج
  if (message.content.toUpperCase() === "خ") {
    if (!attendance[userId] || !attendance[userId].inTime) {
      return message.reply("❌ أنت غير مسجل دخول");
    }

    const inTime = new Date(attendance[userId].inTime);
    const diff = now - inTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    delete attendance[userId].inTime; // إزالة وقت الدخول بعد الخروج
    saveAttendance();

    message.reply(
      `🟥 تم تسجيل الخروج
👤 الاسم: ${message.author.username}
⏱ المدة: ${minutes} دقيقة و ${seconds} ثانية`
    );
  }
});

// ضع توكن البوت هنا
client.login(process.env.DISCORD_TOKEN);
//client.login("MTQ3NjQzNjU3NTEwODg2MjExNQ.GAi7IG.X-JFIxZA7BwaaWWkfpMmKZXyxf3hpdmDIGSIyU");