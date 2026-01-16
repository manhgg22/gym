import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import workoutRoutes from "./routes/workout.js";

import { sendTelegram } from "./services/telegram.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", workoutRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    sendTelegram(`❌ **Server Error**\n\n\`${err.message}\``);
    res.status(500).json({ error: "Internal Server Error" });
});

// Capture Uncaught Exceptions
process.on("uncaughtException", (err) => {
    console.error("🔥 Uncaught Exception:", err);
    sendTelegram(`💀 **Critical Error: Uncaught Exception**\n\n\`${err.message}\``).finally(() => {
        process.exit(1);
    });
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("🔥 Unhandled Rejection:", reason);
    sendTelegram(`⚠️ **Unhandled Rejection**\n\n\`${reason}\``);
});

// Start server
app.listen(PORT, async () => {
    console.log(`🏋️  Workout Tracker Server running on port ${PORT}`);
    console.log(`📊 Google Sheets ID: ${process.env.SHEET_ID?.slice(0, 10)}...`);
    console.log(`⏰ Timezone: ${process.env.TZ || "system default"}`);

    // Notify startup
    // await sendTelegram("🚀 **Server Started**\nBackend is now online.");
});
