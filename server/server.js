import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import workoutRoutes from "./routes/workout.js";

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

// Start server
app.listen(PORT, () => {
    console.log(`🏋️  Workout Tracker Server running on port ${PORT}`);
    console.log(`📊 Google Sheets ID: ${process.env.SHEET_ID?.slice(0, 10)}...`);
    console.log(`⏰ Timezone: ${process.env.TZ || "system default"}`);
});
