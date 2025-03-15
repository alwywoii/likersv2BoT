const axios = require("axios");

async function stalkTiktok(sock, sender, username) {
    await sock.sendMessage(sender, { text: "*Sedang diproses...*" });

    try {
        const response = await axios.get(`https://api.ryzendesu.vip/api/stalk/tiktok?username=${username}`);
        const data = response.data;

        if (!data || !data.userInfo) {
            let failMsg = await sock.sendMessage(sender, { text: "❌ Gagal menemukan akun TikTok." });

            // Auto hapus pesan setelah 1 menit
            setTimeout(() => {
                sock.sendMessage(sender, { delete: failMsg.key });
            }, 60000);

            return;
        }

        const user = data.userInfo;
        let message = `*DATA TIKTOK:*\n\n`;
        message += `👤 *Username:* ${user.username}\n`;
        message += `📝 *Nama:* ${user.name}\n`;
        message += `📌 *Bio:* ${user.bio || "Tidak ada"}\n`;
        message += `✅ *Terverifikasi:* ${user.verified ? "Ya ✅" : "Tidak ❌"}\n`;
        message += `👥 *Followers:* ${user.totalFollowers}\n`;
        message += `👤 *Following:* ${user.totalFollowing}\n`;
        message += `❤️ *Total Likes:* ${user.totalLikes}\n`;
        message += `🎥 *Total Video:* ${user.totalVideos}\n`;
        message += `👫 *Total Teman:* ${user.totalFriends}\n\n`;
        message += `> *Informasi stalker TikTok otomatis akan dihapus setelah 1 menit*`;

        let sentMsg = await sock.sendMessage(sender, {
            image: { url: user.avatar },
            caption: message
        });

        // Auto hapus pesan setelah 1 menit
        setTimeout(() => {
            sock.sendMessage(sender, { delete: sentMsg.key });
        }, 60000);

    } catch (error) {
        console.error("❌ Error stalking TikTok:", error.message);
        let errorMsg = await sock.sendMessage(sender, { text: "*GAADA DATA YANG DITEMUKAN!*\n\n_Ulangi kembali dengan memasukkan username yang benar!_" });

        // Auto hapus pesan error setelah 1 menit
        setTimeout(() => {
            sock.sendMessage(sender, { delete: errorMsg.key });
        }, 60000);
    }
}

module.exports = { stalkTiktok };
