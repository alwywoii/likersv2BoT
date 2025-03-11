require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const axios = require("axios");
const { Client } = require("pg");

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
    4: { name: "STALKER FREE FIRE", type: "ff" } // Layanan ke-4 (Stalker FF)
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
*Pilih Tools GRATIS! dibawah ini:*\n
- _1️⃣ LIKE INSTAGRAM (10 LIKES)_
- _2️⃣ VIEWS TIKTOK (100 VIEWS)_
- _3️⃣ LIKE YOUTUBE (100 LIKES)_\n\n
> _Layanan Full GRATIS!!_
> _Bisa Digunakan Berulang kali_\n
*Ketik angka untuk memilih tools!*\n`});
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
       
       const { exec } = require("child_process");

// Fungsi untuk menangani Stalker Free Fire
async function handleStalkFF(sock, sender, text) {
    const userId = text.split(" ")[1];
    if (!userId) {
        await sock.sendMessage(sender, { text: "⚠️ Masukkan User ID FF!\nContoh: !stalkff 671022112" });
        return;
    }

    // Jalankan ff.js dengan User ID sebagai argumen
    exec(`node ff.js ${userId}`, async (error, stdout, stderr) => {
        if (error) {
            await sock.sendMessage(sender, { text: "❌ Gagal menjalankan stalker FF." });
            console.error(error);
            return;
        }

        // Kirim hasil dari ff.js ke WhatsApp
        await sock.sendMessage(sender, { text: stdout });
    });
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
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (text.startsWith("!stalkff ")) {
        await handleStalkFF(sock, sender, text);
    }
});

sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    if (!text) return;
    console.log(`📩 Pesan dari ${sender}: ${text}`);

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
            text: `*Mau order ${SERVICES[userSelections[sender].serviceKey].name} berapa?*\n\nCukup ketik pakai angka saja\n> Max Order 25`
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
        await sock.sendMessage(sender, { text: `*Mau order ${SERVICES[serviceKey].name} berapa?*\n\nCukup ketik pakai angka saja\n> Max Order 25` });
        return;
    }

    if (userSelections[sender]?.step === "choose_quantity") {
        const quantity = parseInt(text);
        if (isNaN(quantity) || quantity <= 0) {
            await sock.sendMessage(sender, { text: "*masukan angka aja😑*" });
            return;
        }

        if (quantity > 25) {
            await sock.sendMessage(sender, { text: "*maksimal order cuma 25 woii😒*" });
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
        text: `             *=== STATUS ORDER ===*\n\n✅ Order Berhasil: *${successCount}*\n❌ Order Gagal: *${failCount}*\n> _Estimasi proses pengiriman max 24 jam, yang pasti no komplain🗿_\n\n> *Mau order lagi?*\n> Ketik *Y* ( untuk order lagi )\n> Ketik *N* ( kembali ke daftar layanan )\n*_Support Me Guys. Donate Seiklhasnya 🙏🏻_*\n*_Link QRIS: qris-likerv2.vercel.app_*`
    });
} else {
    // Jika semua order gagal, gunakan notifikasi berbeda
    await sock.sendMessage(sender, {
        text: `❌ *Semua order gagal!* ❌\n\n🚨 Sepertinya ada masalah dengan sistem atau layanan sedang down.\n\nSilakan coba lagi nanti atau hubungi admin jika masalah berlanjut.\n\n*Ketik N untuk kembali ke daftar layanan.*`
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
