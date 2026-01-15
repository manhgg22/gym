import express from "express";
import {
    getSessions,
    getExercises,
    getLogs,
    logWorkout,
    logExerciseCheck,
    rowsToObjects,
    getRange,
} from "../services/sheets.js";
import { notifyEvent } from "../services/notifications.js";

const router = express.Router();

/**
 * Calculate next session in cycle
 * @param {string} lastSessionId - Last completed session ID
 * @param {number} mode - 4 or 5 sessions per week
 * @returns {string} - Next session ID
 */
function nextSessionCycle(lastSessionId, mode = 4) {
    const cycle4 = ["S1", "S2", "S3", "S4"];
    const cycle5 = ["S1", "S2", "S3", "S4", "S5"];
    const cycle = mode === 5 ? cycle5 : cycle4;

    if (!lastSessionId) return cycle[0];
    const idx = cycle.indexOf(lastSessionId);
    if (idx === -1) return cycle[0]; // fallback if not found
    return cycle[(idx + 1) % cycle.length];
}

/**
 * GET /today-plan?mode=4|5
 * Returns today's workout plan
 */
router.get("/today-plan", async (req, res) => {
    try {
        const mode = Number(req.query.mode || 4);

        // Get all logs and find last completed session
        const logs = await getLogs();
        const completedLogs = logs
            .filter((l) => String(l.completed).toUpperCase() === "TRUE")
            .sort((a, b) => (a.date > b.date ? -1 : 1));
        const lastLog = completedLogs[0];

        // Calculate next session
        const sessionId = nextSessionCycle(lastLog?.session_id, mode);

        // Get session details
        const sessions = await getSessions();
        const session = sessions.find((s) => s.session_id === sessionId);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // Get exercises for this session
        const exercises = await getExercises(sessionId);

        // Tips
        const tips = [
            "Khởi động 5–8 phút (vai/lưng trên/khớp).",
            "Uống nước trước tập 300–500ml.",
            "Giữ form trước, tạ sau.",
        ];

        res.json({
            date: new Date().toISOString().slice(0, 10),
            mode,
            session,
            exercises,
            tips,
        });
    } catch (error) {
        console.error("Error in /today-plan:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /month-summary?month=YYYY-MM
 * Returns workout summary for a month
 */
router.get("/month-summary", async (req, res) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const logs = await getLogs();

        // Filter logs for this month
        const monthLogs = logs.filter((l) => l.date && l.date.startsWith(month));

        // Count completed workouts
        const completedCount = monthLogs.filter(
            (l) => String(l.completed).toUpperCase() === "TRUE"
        ).length;

        // Calculate streak (consecutive days with workouts)
        const allLogs = logs
            .filter((l) => String(l.completed).toUpperCase() === "TRUE")
            .sort((a, b) => (a.date > b.date ? -1 : 1));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const log of allLogs) {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor(
                (currentDate - logDate) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === streak) {
                streak++;
            } else if (diffDays > streak) {
                break;
            }
        }

        // Build calendar data
        const calendar = monthLogs.map((l) => ({
            date: l.date,
            session_id: l.session_id,
            completed: String(l.completed).toUpperCase() === "TRUE",
            note: l.note,
        }));

        res.json({
            month,
            completedCount,
            streak,
            calendar,
        });
    } catch (error) {
        console.error("Error in /month-summary:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /log
 * Log a workout session
 */
router.post("/log", async (req, res) => {
    try {
        const { date, session_id, completed, duration_min, note } = req.body;

        if (!date || !session_id) {
            return res.status(400).json({ error: "date and session_id required" });
        }

        // Check if workout already exists for this date
        const logs = await getLogs();
        const existingLog = logs.find(
            (l) => l.date === date && String(l.completed).toUpperCase() === "TRUE"
        );

        if (existingLog) {
            // Send duplicate warning notification
            const sessions = await getSessions();
            const session = sessions.find((s) => s.session_id === existingLog.session_id);

            await notifyEvent("DUPLICATE_WORKOUT", {
                sessionName: session?.session_name || existingLog.session_id,
                date: date,
            });

            return res.status(400).json({
                error: "Bạn đã tập rồi hôm nay! Mỗi ngày chỉ được tập 1 buổi.",
                existingSession: existingLog.session_id,
            });
        }

        await logWorkout(date, session_id, completed, duration_min, note);

        // Send success notification
        const sessions = await getSessions();
        const session = sessions.find((s) => s.session_id === session_id);

        await notifyEvent("WORKOUT_LOGGED", {
            sessionName: session?.session_name || session_id,
        });

        res.json({ ok: true });
    } catch (error) {
        console.error("Error in /log:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /quick-checkin
 * Quick check-in without detailed exercise tracking
 */
router.post("/quick-checkin", async (req, res) => {
    try {
        const mode = Number(req.body.mode || 4);

        // Use GMT+7 timezone
        const now = new Date();
        const gmt7Offset = 7 * 60; // GMT+7 in minutes
        const localOffset = now.getTimezoneOffset();
        const gmt7Time = new Date(now.getTime() + (gmt7Offset + localOffset) * 60000);
        const date = gmt7Time.toISOString().slice(0, 10);

        const note = req.body.note || "";

        // Check if already worked out today
        const logs = await getLogs();
        const existingLog = logs.find(
            (l) => l.date === date && String(l.completed).toUpperCase() === "TRUE"
        );

        if (existingLog) {
            return res.status(400).json({
                error: "Bạn đã tập rồi hôm nay! Mỗi ngày chỉ được tập 1 buổi.",
                existingSession: existingLog.session_id,
                date: date,
            });
        }

        // Get next session
        const completedLogs = logs
            .filter((l) => String(l.completed).toUpperCase() === "TRUE")
            .sort((a, b) => (a.date > b.date ? -1 : 1));
        const lastLog = completedLogs[0];
        const sessionId = nextSessionCycle(lastLog?.session_id, mode);

        // Log workout
        await logWorkout(date, sessionId, true, "", note);

        // Get session info
        const sessions = await getSessions();
        const session = sessions.find((s) => s.session_id === sessionId);

        res.json({
            ok: true,
            message: "Check-in thành công!",
            session: session,
            date: date,
        });
    } catch (error) {
        console.error("Error in /quick-checkin:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /exercise-check
 * Log an exercise check
 */
router.post("/exercise-check", async (req, res) => {
    try {
        const { date, session_id, exercise_id, checked } = req.body;

        if (!date || !session_id || !exercise_id) {
            return res
                .status(400)
                .json({ error: "date, session_id, and exercise_id required" });
        }

        await logExerciseCheck(date, session_id, exercise_id, checked);
        res.json({ ok: true });
    } catch (error) {
        console.error("Error in /exercise-check:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /sessions
 * Get all workout sessions
 */
router.get("/sessions", async (req, res) => {
    try {
        const sessions = await getSessions();
        res.json(sessions);
    } catch (error) {
        console.error("Error in /sessions:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /exercises?session_id=S1
 * Get exercises (optionally filtered by session)
 */
router.get("/exercises", async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        const exercises = await getExercises(sessionId);
        res.json(exercises);
    } catch (error) {
        console.error("Error in /exercises:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
