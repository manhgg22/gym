const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

/**
 * Get today's workout plan
 * @param {number} mode - 4 or 5 sessions per week
 */
export async function getTodayPlan(mode = 4) {
    const r = await fetch(`${API}/today-plan?mode=${mode}`);
    if (!r.ok) throw new Error("Failed to fetch today plan");
    return r.json();
}

/**
 * Get month summary
 * @param {string} month - YYYY-MM format
 */
export async function getMonthSummary(month) {
    const r = await fetch(`${API}/month-summary?month=${month}`);
    if (!r.ok) throw new Error("Failed to fetch month summary");
    return r.json();
}

/**
 * Log a workout session
 */
export async function postLog(payload) {
    const r = await fetch(`${API}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (!r.ok) {
        throw new Error(data.error || "Failed to log workout");
    }

    return data;
}

/**
 * Quick check-in (no detailed exercise tracking)
 */
export async function quickCheckin(mode = 4, note = "") {
    const r = await fetch(`${API}/quick-checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, note }),
    });

    const data = await r.json();

    if (!r.ok) {
        throw new Error(data.error || "Failed to check-in");
    }

    return data;
}

/**
 * Log an exercise check
 */
export async function postExerciseCheck(payload) {
    const r = await fetch(`${API}/exercise-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (!r.ok) {
        throw new Error(data.error || "Failed to log exercise check");
    }

    return data;
}

/**
 * Get all sessions
 */
export async function getSessions() {
    const r = await fetch(`${API}/sessions`);
    if (!r.ok) throw new Error("Failed to fetch sessions");
    return r.json();
}

/**
 * Get exercises for a session
 */
export async function getExercises(sessionId) {
    const url = sessionId
        ? `${API}/exercises?session_id=${sessionId}`
        : `${API}/exercises`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Failed to fetch exercises");
    return r.json();
}
