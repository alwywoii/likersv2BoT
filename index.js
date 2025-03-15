require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const axios = require("axios");
const { Client } = require("pg");
const { stalkFreeFire } = require("./Layanan/ff");
const { stalkTiktok } = require("./Layanan/tt");
const { remini } = require("./Layanan/remini");
const { spotifyDownload } = require("./Layanan/spotify");

// Daftar API Key
const API_KEYS = [
    "QA0xv-6c5EP-WJVKN-zRLLT-aunZK",
    "RSSaO-HGvRt-kKE5f-e3msn-rNNb6",
    "qBMzf-Rm5Qe-kBTig-o4PDh-klx2X",
    "wjP17-xmFPY-hIwvH-YqC05-h0doN",
    "ogOm2-th6CI-bIDgz-xyqNj-VKMgS",
    "FOTrA-G9Rtv-miwjG-oJmRH-mqfsN",
    "PMXy3-YuWQI-x7XBF-f0DB6-XmpZn",
    "WXuSD-545YE-tKkBD-1PI7P-mzOVi",
    "NHxjp-AZZnd-LGC4q-kkjqB-Hrqqh"
];

// Fungsi untuk mendapatkan API key secara acak
function getRandomAPIKey() {
    return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
}

// Daftar layanan
const SERVICES = {
    1: { name: "LIKE INSTAGRAM (10 LIKES)", service: "11288", jumlah: "10" },
    2: { name: "VIEWS TIKTOK (100 VIEWS)", service: "11285", jumlah: "100" },
    3: { name: "LIKE YOUTUBE (100 LIKES)", service: "16472", jumlah: "100" },
    10: { name: "StalkTT"},
    11: { name: "StalkFF"},
    12: { name: "remini"},
    13: { name: "Spotify"}
};
 
// Simpan status pengguna
const userSelections = {};

// Fungsi generate fake IP
function generateFakeIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

let lastReconnectTime = 0; // Menyimpan timestamp terakhir reconnect

// Fungsi koneksi database
function connectDB() {
    const db = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    db.connect()
        .then(() => console.log("✅ Koneksi ke database berhasil."))
        .catch((err) => console.error("❌ Gagal konek database:", err));

    db.on("error", (err) => {
        console.error("❌ Database error:", err);
        attemptReconnect();
    });

    return db;
}

// Global database
global.db = connectDB();

// Fungsi untuk reconnect setiap 1 menit
function attemptReconnect() {
    const now = Date.now();
    if (now - lastReconnectTime >= 30000) { // 60 detik (1 menit)
        console.log("🔄 Melakukan reconnect ke database...");
        global.db.end().catch(() => {}); // Tutup koneksi lama
        global.db = connectDB(); // Buat koneksi baru
        lastReconnectTime = now;
    }
}

// Interval untuk reconnect setiap 1 menit
setInterval(attemptReconnect, 30000);


// Fungsi mengirim daftar layanan
async function sendServiceList(sock, sender) {
    await sock.sendMessage(sender, { text: `     
         *----- 🄲🄰🅃🅉🄱🄾🅃 -----*\n
*List Layanan:*\n
- *1. LIKE INSTAGRAM (10 LIKES)*
- *2. VIEWS TIKTOK (100 VIEWS)*
- *3. LIKE YOUTUBE (100 LIKES)*\n\n
*Layanan Lainya:*\n
- *10. STALK TIKTOK*
- *11. CEK ID FREE FIRE ( LENGKAP! )*
- *12. Remini ( Editing Photos )*
- *13. Download Lagu Spotify*\n\n
> _100% GRATIS!!_
> _Bisa Digunakan Berulang kali Untuk Kebutuhan Sosmed_\n
*Pilih layanan dengan mengtik angka saja!*`});
    userSelections[sender] = { step: "choose_service" };
}

// Fungsi koneksi ke WhatsApp
async function connectToWhatsApp() {
    console.log("🔄 Bot sedang konek ke WhatsApp...");

    try {
        const { state, saveCreds } = await useMultiFileAuthState("auth");
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
        });

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", (update) => {
            const { connection } = update;
            if (connection === "close") {
                console.warn("⚠️ Koneksi WhatsApp terputus, mencoba koneksi ulang...");
                setTimeout(connectToWhatsApp, 1000);
            }
        });
       global.db = connectDB(); // Reconnect database
       
// Fungsi validasi URL
function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

// Fungsi untuk memodifikasi link berdasarkan layanan
function modifyLink(link) {
    try {
        const url = new URL(link);

        // Instagram
        if (url.hostname === "www.instagram.com" && url.pathname.startsWith("/p/")) {
            url.searchParams.delete("igsh");
            url.searchParams.set("igsh", generateRandomIGSH());
        }

        // TikTok
        if (url.hostname.includes("tiktok.com")) {
            url.searchParams.set("_t", generateRandomNumber(10));
        }

        // YouTube
        if (url.hostname.includes("youtu.be") || url.hostname.includes("youtube.com")) {
            if (url.searchParams.has("si")) {
                url.searchParams.set("si", generateRandomString(16));
            }
        }

        return url.toString();
    } catch (error) {
        console.error("❌ Error memodifikasi link:", error.message);
        return link;
    }
}

// Fungsi untuk menghasilkan parameter acak
function generateRandomIGSH() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    return Array.from({ length: 22 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function generateRandomNumber(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function generateFakeIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// Jalankan bot
sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    console.log("📩 Pesan diterima dari:", sender);
    console.log("📜 Isi pesan:", text || "[Bukan teks]");

    // 🖼 Cek apakah ada gambar biasa atau sekali lihat
    let imageMessage = msg.message?.imageMessage;
    let viewOnceMessage = msg.message?.viewOnceMessage?.message?.imageMessage;

    if (imageMessage) {
        console.log("🖼 Gambar biasa terdeteksi!");
    } else if (viewOnceMessage) {
        console.log("❌ Gambar sekali lihat terdeteksi!");
        await sock.sendMessage(sender, { text: "⚠️ Maaf, gambar sekali lihat belum didukung. Silakan kirim ulang gambar tanpa sekali lihat." });
        return;
    } else if (!text) {
        console.log("❌ Pesan bukan teks atau gambar.");
        return;
    } else {
        console.log("❌ Pesan bukan gambar.");
    }

    // Jika layanan Remini dipilih, hanya terima gambar biasa
    if (userSelections[sender]?.serviceKey === 12) {
    if (text.toLowerCase() === "list") {
        delete userSelections[sender]; // Reset pilihan layanan
        await sendServiceList(sock, sender);
        return;
    }

    if (imageMessage) {
        console.log("🔄 Memproses gambar dengan Remini...");
        await remini(sock, msg); // Jalankan fungsi Remini
        delete userSelections[sender]; // Reset setelah diproses
        return;
    } else {
        await sock.sendMessage(sender, { text: "*HANYA GAMBAR!, SILAHKAN UPLOAD GAMBAR..*" });
        return;
    }
}

    if (!text) return;
    
    if (!userSelections[sender]) {
        await sendServiceList(sock, sender);
        return;
    }

    if (text.toLowerCase() === "list") {
        await sendServiceList(sock, sender);
        return;
    }
    
    if (userSelections[sender]?.step === "confirm_retry") {
        if (text.toLowerCase() === "y") {
            userSelections[sender].step = "choose_quantity";
            await sock.sendMessage(sender, { 
                text: `*Mau order berapa?*\n*( KETIK ANGKA SAJA )*\n> *Max Order 25*\n\n> *CONTOH:* _order 1 like IG = 10 likes, jika order max 25 tinggal kalikan 25×10 = 250 likes_ `
            });
            return;
        } else if (text.toLowerCase() === "n") {
            await sendServiceList(sock, sender);
            delete userSelections[sender];
            return;
        }
    }

if (userSelections[sender]?.step === "choose_service") {
    const serviceKey = parseInt(text);
    if (isNaN(serviceKey) || !SERVICES[serviceKey]) {
        await sock.sendMessage(sender, { text: "*Pilih yang benar kocakk😭🗿🗿*" });
        return;
    }

    userSelections[sender] = { step: "choose_quantity", serviceKey };

    if (serviceKey === 10) {
        await sock.sendMessage(sender, { text: "*Username TikTok?*" });
    } else if (serviceKey === 11) {
        await sock.sendMessage(sender, { text: "*ID FREE FIRE?*" });
    } else if (serviceKey === 12) {
        await sock.sendMessage(sender, { text: "*Silahkan Upload Gambar..*\n> *_Maaf Upload Gambar Sekali Lihat Belum Support, tngkyuu🙏_*" });
    } else if (serviceKey === 13) {
        await sock.sendMessage(sender, { text: "*Link Spotify?*" });
    } else {
        await sock.sendMessage(sender, { text: `*Mau order berapa?*\n*( KETIK ANGKA SAJA )*\n> *Max Order 25*\n\n> *CONTOH:* _order 1 like IG = 10 likes, jika order max 25 tinggal kalikan 25×10 = 250 likes_` });
    }
    return;
}

// Jika pengguna memilih layanan 4 dan memasukkan ID Free Fire
if (userSelections[sender]?.step === "choose_quantity") {
    if (userSelections[sender].serviceKey === 10) {
        // Cek apakah input kosong atau hanya angka (username TikTok harus ada huruf)
        if (!text || /^\d+$/.test(text)) { 
            await sock.sendMessage(sender, { text: "*Masukkan Username TikTok yang Benar!*" });
            return;
        }

        await stalkTiktok(sock, sender, text); // Panggil fungsi dari tt.js
        delete userSelections[sender];
        return;
    }

    if (userSelections[sender].serviceKey === 11) {
        if (isNaN(text)) {
            await sock.sendMessage(sender, { text: "*MASUKAN ID BUKAN USERNAME HMMM..*" });
            return;
        }
       await stalkFreeFire(sock, sender, text); // Panggil fungsi dari ff.js
        delete userSelections[sender];
        return;
    }
    
    if (userSelections[sender]?.serviceKey === 13) {
    if (!text.startsWith("https://open.spotify.com/track/")) {
        await sock.sendMessage(sender, { text: "*Kirim link dari Spotify, Selain itu tidak bisa..*" });
        return;
    }

    console.log("🔄 Memproses lagu dari Spotify...");
    await spotifyDownload(sock, sender, text); // Jalankan fungsi unduhan Spotify
    delete userSelections[sender]; // Reset setelah diproses
    return;
}
    
}

    if (userSelections[sender]?.step === "choose_quantity") {
        const quantity = parseInt(text);
        if (isNaN(quantity) || quantity <= 0) {
            await sock.sendMessage(sender, { text: "*masukan angka aja😑*" });
            return;
        }

        if (quantity > 25) {
            await sock.sendMessage(sender, { text: "*maksimal order cuma 25😒*" });
            return;
        }

        userSelections[sender].quantity = quantity;
        userSelections[sender].step = "awaiting_order";

        await sock.sendMessage(sender, { text: `*Kirimkan Link Dengan Format:* "boost"\n\n*Contoh:*\n_boost https://www.instagram.com/XXXXXX_` });
        return;
    }

    if (userSelections[sender]?.step === "awaiting_order" || userSelections[sender]?.step === "retry_order") {
        if (!text.toLowerCase().startsWith("boost ")) {
            await sock.sendMessage(sender, { text: "*FORMAT SALAH!*\nGunakan format:\n_boost <link>_\n\nContoh:\n_boost https://www.instagram.com/XXXXXX_" });
            return;
        }

        const link = text.replace(/^boost\s+/i, "").trim();
        if (!isValidURL(link)) {
            await sock.sendMessage(sender, { text: "*FORMAT SALAH!*\nGunakan format:\n_boost <link>_\n\nContoh:\n_boost https://www.instagram.com/XXXXXX_" });
            return;
        }

        const serviceKey = userSelections[sender].serviceKey;
        const selectedService = SERVICES[serviceKey];
        const quantity = userSelections[sender].quantity;

        await sock.sendMessage(sender, { text: `_⏳Orderan sedang diproses..._\n*📌Jumlah: ${quantity}*\n> *Harap sabar, semakin banyak you order makin lama!*` });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < quantity; i++) {
            try {
                const fakeIP = generateFakeIP();
                const modifiedLink = modifyLink(link);

                const response = await axios.post(
                    "https://www.nengpanel.com/API/v1.php",
                    new URLSearchParams({
                        api_key: getRandomAPIKey(),
                        action: "order",
                        service: selectedService.service,
                        target: modifiedLink,
                        quantity: selectedService.jumlah
                    }).toString(),
                    {
                        headers: { 
                            "X-Forwarded-For": fakeIP,
                            "Client-IP": fakeIP,
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    }
                );

                if (response.data.status) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`❌ API Error (order ke-${i + 1}):`, error.message);
                failCount++;
            }
        }

    if (successCount > 0) {
    // Jika ada yang berhasil, gunakan notifikasi utama
    await sock.sendMessage(sender, {
    text: `「🔰STATUS ORDER🔰」\n\n*Layanan: ${SERVICES[serviceKey].name}*\n✅ Order Berhasil: *${successCount}*\n❌ Order Gagal: *${failCount}*\n> _Estimasi proses pengiriman max 24 jam, yang pasti no komplain🗿_\n\n> *Mau order lagi?*\n> Ketik *Y* ( untuk order lagi )\n> Ketik *N* ( kembali ke daftar layanan )\n*_Hubungi Admin Jika ada Kenadala._*\n*_Telegram Admin: @Messi_NFT_*`
    });
} else {
    // Jika semua order gagal, gunakan notifikasi berbeda
    await sock.sendMessage(sender, {
        text: `*⚠️ LAYANAN MAINTENANCE⚠️*\n\n*_Layanan untuk ${SERVICES[serviceKey].name} Sedang Tidak Aktif, Silahkan Gunakan Layanan Lainya.._*\n\n*KETIK _N_ UNTUK KEMBALI KE LAYANAN!*`
    });
}

userSelections[sender].step = "confirm_retry";
return;

    }
});

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

// Fungsi validasi URL
function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

// Fungsi untuk memodifikasi link Instagram
function modifyInstagramLink(link) {
    const url = new URL(link);
    if (url.hostname === "www.instagram.com" && url.pathname.startsWith("/p/")) {
        const igshParam = generateRandomIGSH();
        url.searchParams.set("igsh", igshParam, "===");
    }
    return url.toString();
}

// Fungsi untuk menghasilkan parameter igsh acak
function generateRandomIGSH() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 22; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Jalankan bot
connectToWhatsApp();
