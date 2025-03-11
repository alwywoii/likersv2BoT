require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

let lastMessageId = null; // Variabel untuk menyimpan ID pesan terakhir

async function connectToWhatsApp() {
    console.log("Bot sedang konek ke WhatsApp...");

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
                console.warn("Koneksi WhatsApp terputus, mencoba koneksi ulang...");
                setTimeout(connectToWhatsApp, 0);
            }
        });

        sock.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const sender = msg.key.remoteJid;
            const messageId = msg.key.id; // Ambil ID pesan

            if (lastMessageId === messageId) {
                console.log("Pesan sudah dikirim, menghindari duplikasi...");
                return;
            }

            lastMessageId = messageId; // Simpan ID pesan terakhir yang diproses

            await sock.sendMessage(sender, { 
                text: "⚠️BOT MAINTENANCE!⚠️\n\n*_Dikarenakan banyak yang akses bot menjadi down._*\n\nMohon ditunggu sebentar ya..🙏" 
            });
        });

    } catch (error) {
        console.error("Fatal Error:", error.message);
    }
}

// Jalankan bot
connectToWhatsApp();
