require("dotenv").config();
const axios = require("axios");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function startFFStalker() {
    console.log("🚀 Stalker Free Fire berjalan...");

    // Inisialisasi WA Socket
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message || !m.key.remoteJid) return;

        const sender = m.key.remoteJid;
        const messageText = m.message.conversation || m.message.extendedTextMessage?.text || "";

        if (messageText.startsWith("!ff ")) {
            const userId = messageText.split(" ")[1];

            if (!userId) {
                await sock.sendMessage(sender, { text: "❌ Harap masukkan ID Free Fire!\nContoh: *!ff 671022112*" });
                return;
            }

            try {
                await sock.sendMessage(sender, { text: "⏳ Sedang mencari data..." });

                // Panggil API Stalker FF
                const response = await axios.get(`https://api.ryzendesu.vip/api/stalk/ff?userId=${userId}`);
                const data = response.data;

                if (!data.name) {
                    await sock.sendMessage(sender, { text: "❌ Data tidak ditemukan!" });
                    return;
                }

                // Format hasilnya
                const result = `🔥 *Stalker Free Fire* 🔥
👤 *Nickname:* ${data.name}
📖 *Bio:* ${data.bio || "Tidak ada"}
👍 *Like:* ${data.like}
🏆 *Level:* ${data.level}
🎖️ *Rank Battle Royale:* ${data.brRank} (${data.brRankPoint})
⚔️ *Rank Clash Squad:* ${data.csRankPoint}
🌍 *Region:* ${data.region}
🕰️ *Terakhir Login:* ${data.lastLogin}
📅 *Akun Dibuat:* ${data.accountCreated}

🔹 *Pet:* ${data.petInformation?.name || "Tidak ada"} (Level ${data.petInformation?.level})
🛡️ *Preferensi Mode:* ${data.preferMode}
🗣️ *Bahasa:* ${data.language}`;

                await sock.sendMessage(sender, { text: result });

            } catch (error) {
                console.error("❌ Error mengambil data:", error);
                await sock.sendMessage(sender, { text: "❌ Gagal mengambil data! Coba lagi nanti." });
            }
        }
    });

    console.log("✅ Stalker Free Fire siap digunakan!");
}

// Jalankan fungsi
startFFStalker();
