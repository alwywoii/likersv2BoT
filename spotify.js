const axios = require("axios");

async function spotifyDownload(sock, sender, url) {
    try {
        await sock.sendMessage(sender, { text: "*Memproses lagu dari Spotify...*" });

        const response = await axios.get(`https://api.ryzendesu.vip/api/downloader/spotify?url=${encodeURIComponent(url)}`);
        const data = response.data;

        if (!data.success) {
            throw new Error("❌ Gagal mendapatkan lagu. Pastikan link benar.");
        }

        const { title, artists } = data.metadata;
        const audioUrl = data.link;

        const caption = `*BERHASIL, SILAHKAN DI UNDUH*\n> *_Artist: ${artists}_*\n> *_Judul: ${title}_*`;

        // Kirim lagu MP3 sebagai dokumen
        await sock.sendMessage(sender, { 
            document: { url: audioUrl },
            mimetype: "audio/mp3",
            fileName: `${title} - ${artists}.mp3`,
            caption: caption
        });

    } catch (error) {
        console.error("Error di fungsi spotifyDownload:", error);
        await sock.sendMessage(sender, { text: "❌ Gagal mengunduh lagu. Coba lagi nanti!" });
    }
}

module.exports = { spotifyDownload };