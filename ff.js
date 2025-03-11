const axios = require("axios");

const userId = process.argv[2]; // Ambil User ID dari argumen
if (!userId) {
    console.log("❌ Masukkan User ID!");
    process.exit(1);
}

const apiUrl = `https://api.ryzendesu.vip/api/stalk/ff?userId=${userId}`;
axios.get(apiUrl)
    .then(response => {
        const data = response.data;

        let result = `🔥 *STALKER FREE FIRE* 🔥\n`;
        result += `👤 *Nickname:* ${data.name}\n`;
        result += `📜 *Bio:* ${data.bio || 'Tidak ada'}\n`;
        result += `👍 *Like:* ${data.like}\n`;
        result += `🎯 *Level:* ${data.level}\n`;
        result += `🌍 *Region:* ${data.region}\n`;
        result += `🏆 *Honor Score:* ${data.honorScore}\n`;
        result += `🕘 *Terakhir Login:* ${data.lastLogin}\n`;

        console.log(result); // Kirim hasil ke index.js
    })
    .catch(error => {
        console.log("⚠️ Gagal mengambil data! Periksa User ID.");
    });
