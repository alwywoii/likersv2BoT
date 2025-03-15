const axios = require("axios");

async function stalkFreeFire(sock, sender, userID) {
    await sock.sendMessage(sender, { text: `*Sedang diproses..*` });

    try {
        const response = await axios.get(`https://api.ryzendesu.vip/api/stalk/ff?userId=${userID}`);
        const data = response.data;

        if (!data || !data.name) {
            await sock.sendMessage(sender, { text: "❌ Gagal menemukan akun Free Fire." });
            return;
        }

        let message = `*🔍 DATA FREE FIRE*\n\n`;
        message += `👤 *Nickname:* ${data.name}\n`;
        message += `📝 *Bio:* ${data.bio || 'Tidak ada'}\n`;
        message += `👍 *Like:* ${data.like}\n`;
        message += `🎮 *Level:* ${data.level}\n`;
        message += `⭐ *EXP:* ${data.exp}\n`;
        message += `🌍 *Region:* ${data.region}\n`;
        message += `🏅 *Honor Score:* ${data.honorScore}\n`;
        message += `🏆 *BR Rank:* ${data.brRank}\n`;
        message += `🔢 *BR Rank Point:* ${data.brRankPoint}\n`;
        message += `📅 *Akun Dibuat:* ${data.accountCreated}\n`;
        message += `⏰ *Login Terakhir:* ${data.lastLogin}\n`;
        message += `🎯 *Mode Favorit:* ${data.preferMode}\n`;
        message += `🗣️ *Bahasa:* ${data.language}\n`;
        message += `💎 *Booyah Pass Premium:* ${data.booyahPassPremium}\n`;
        message += `🎫 *Booyah Pass Level:* ${data.booyahPassLevel || 'N/A'}\n`;

        if (data.petInformation) {
            message += `\n*🐾 INFORMASI PET*\n`;
            message += `🐶 *Nama Pet:* ${data.petInformation.name}\n`;
            message += `🎚️ *Level Pet:* ${data.petInformation.level}\n`;
            message += `⭐ *EXP Pet:* ${data.petInformation.exp}\n`;
            message += `🌟 *Star Marked:* ${data.petInformation.starMarked}\n`;
            message += `✅ *Selected:* ${data.petInformation.selected}\n`;
        }

        if (data.guild) {
            message += `\n*🏰 INFORMASI GUILD*\n`;
            message += `${data.guild}\n`;
        }

        if (data.equippedItems && data.equippedItems.length > 0) {
            message += `\n*🎽 ITEM YANG DIPAKAI*\n`;
            data.equippedItems.forEach(item => {
                message += `- ${item.name}\n`;
            });
        }

        await sock.sendMessage(sender, { text: message });
    } catch (error) {
        console.error("❌ Error stalking Free Fire:", error.message);
        await sock.sendMessage(sender, { text: "*GAADA DATA YANG DI TEMUKAN!*\n\n_ulangi kembali ketik tombol *N* ke daftar layanan_" });
    }
}

module.exports = { stalkFreeFire };
