require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

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
                console.warn("тЪая╕П Koneksi WhatsApp terputus, mencoba koneksi ulang...");
                setTimeout(connectToWhatsApp, 0);
            }
        });

        sock.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const sender = msg.key.remoteJid;
            await sock.sendMessage(sender, { text: "⚠️BOT SEDANG UPDATE!⚠️\nSilahkan coba lagi nanti.." });
        });

    } catch (error) {
        console.error("тЭМ Fatal Error:", error.message);
    }
}

// Jalankan bot
connectToWhatsApp();
