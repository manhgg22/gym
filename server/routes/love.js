import express from "express";
import {
    getConfig, getRandomQuote, getMessages, sendMessage,
    getTimeline, addTimelineEvent,
    getDreamList, addDream, toggleDream,
    getMailbox, sendMail
} from "../services/love.js";

const router = express.Router();

// --- CONFIG & QUOTES ---
router.get("/config", async (req, res) => {
    try {
        const config = await getConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/quote", async (req, res) => {
    try {
        const quote = await getRandomQuote();
        res.json(quote || { quote: "Love is in the air", author: "Unknown" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- MESSAGES (Chat) ---
router.get("/messages", async (req, res) => {
    try {
        const messages = await getMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/messages", async (req, res) => {
    try {
        const { sender, content, type } = req.body;
        const result = await sendMessage(sender, content, type);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- TIMELINE ---
router.get("/timeline", async (req, res) => {
    try {
        const data = await getTimeline();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/timeline", async (req, res) => {
    try {
        const { date, title, description, image_url } = req.body;
        const result = await addTimelineEvent(date, title, description, image_url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- DREAM LIST ---
router.get("/dreamlist", async (req, res) => {
    try {
        const data = await getDreamList();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/dreamlist", async (req, res) => {
    try {
        const { task, image_url } = req.body;
        const result = await addDream(task, image_url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/dreamlist/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_completed } = req.body; // boolean
        const result = await toggleDream(id, is_completed);
        res.json({ success: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- MAILBOX ---
router.get("/mailbox", async (req, res) => {
    try {
        const data = await getMailbox();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/mailbox", async (req, res) => {
    try {
        const { sender, title, content } = req.body;
        const result = await sendMail(sender, title, content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
