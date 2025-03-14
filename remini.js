const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

async function remini(sock, msg) {
    try {
        const sender = msg.key.remoteJid;

        // 🔍 Cek apakah pesan mengandung gambar biasa atau sekali lihat
        let messageContent = msg.message?.imageMessage || 
                             msg.message?.viewOnceMessage?.message?.imageMessage;

        if (!messageContent) {
            await sock.sendMessage(sender, { text: "❌ Harap kirim gambar!" });
            return;
        }

        await sock.sendMessage(sender, { text: "*Sedang diproses, silahkan tunggu..*" });

        // 📥 Unduh gambar dari WhatsApp
        const buffer = await downloadMediaMessage(msg, "buffer", {}, { reuploadRequest: sock.updateMediaMessage });

        // 📁 Simpan sementara di penyimpanan bot
        const imagePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
        fs.writeFileSync(imagePath, buffer);

        // 🖼 Upload gambar ke Imgbb
        const formData = new FormData();
        formData.append("image", buffer.toString("base64"));
        formData.append("key", "6635b422e09269dd3efa4ec64cf34597");

        const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
            headers: formData.getHeaders(),
        });

        if (!imgbbResponse.data.success) {
            throw new Error("Gagal upload gambar ke Imgbb.");
        }

        const imageUrl = imgbbResponse.data.data.url;

        // 🎨 Kirim gambar ke API Remini
        const reminiResponse = await axios.get(`https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(imageUrl)}`, {
            responseType: "arraybuffer",
        });

        // 📁 Simpan hasil dari Remini ke file
        const outputPath = path.join(__dirname, `remini_${Date.now()}.jpg`);
        fs.writeFileSync(outputPath, reminiResponse.data);

        // 📤 Kirim hasil ke pengguna dengan fitur HD di WhatsApp
        const sentMsg = await sock.sendMessage(sender, { 
            image: { url: outputPath }, 
            mimetype: "image/jpeg",
            caption: "*OKE, SUDAH JADI.. MAAF YA BILA ADA KEKURANGAN HEHEE..*\n> *_noted: segera simpan gambarnya, bot akan otomatis hapus gambar setelah 1 jam_*"
        });

        // 🕒 Hapus gambar setelah 1 menit (bot & pengguna)
        setTimeout(async () => {
            try {
                // Hapus file dari penyimpanan bot
                fs.unlinkSync(imagePath);
                fs.unlinkSync(outputPath);
                console.log(`🗑 Gambar dihapus dari penyimpanan: ${outputPath}`);

                // Hapus pesan gambar dari bot dan pengguna (Delete for Everyone)
                await sock.sendMessage(sender, { 
                    delete: sentMsg.key // Hapus gambar hasil dari bot
                });

                await sock.sendMessage(sender, { 
                    delete: msg.key // Hapus gambar asli dari pengguna
                });

                console.log("🗑 Gambar pengguna & bot dihapus dari chat (Delete for Everyone)");
            } catch (err) {
                console.error("❌ Gagal menghapus gambar:", err);
            }
        }, 3600000); // 1 jam

        return outputPath;

    } catch (err) {
        console.error("Error di fungsi remini:", err);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Gagal memproses gambar. Coba lagi nanti!" });
        return null;
    }
}

module.exports = { remini };