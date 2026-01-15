// Automated API Tests for Workout Tracker
import fetch from "node-fetch";

const API_BASE = "http://localhost:4000";

// Test results
let passed = 0;
let failed = 0;

// Helper function
async function test(name, fn) {
    try {
        await fn();
        console.log(`✅ PASS: ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}`);
        failed++;
    }
}

// Test 1: Get today's plan
await test("GET /today-plan returns workout plan", async () => {
    const res = await fetch(`${API_BASE}/today-plan?mode=4`);
    const data = await res.json();

    if (!data.session) throw new Error("No session in response");
    if (!data.exercises) throw new Error("No exercises in response");
    if (data.exercises.length === 0) throw new Error("No exercises found");
});

// Test 2: Quick check-in (first time)
await test("POST /quick-checkin succeeds first time", async () => {
    const res = await fetch(`${API_BASE}/quick-checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: 4 }),
    });

    const data = await res.json();

    if (res.status === 400 && data.error?.includes("đã tập rồi")) {
        // Already checked in today - this is OK for testing
        console.log("   Note: Already checked in today (expected if running multiple times)");
        return;
    }

    if (!res.ok) throw new Error(data.error || "Check-in failed");
    if (!data.session) throw new Error("No session in response");
});

// Test 3: Duplicate check-in prevention
await test("POST /quick-checkin prevents duplicate", async () => {
    const res = await fetch(`${API_BASE}/quick-checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: 4 }),
    });

    const data = await res.json();

    // Should fail with 400 status
    if (res.status !== 400) {
        throw new Error("Duplicate check-in was allowed (should be blocked)");
    }

    if (!data.error?.includes("đã tập rồi")) {
        throw new Error("Wrong error message for duplicate");
    }
});

// Test 4: Get month summary
await test("GET /month-summary returns calendar data", async () => {
    const month = new Date().toISOString().slice(0, 7);
    const res = await fetch(`${API_BASE}/month-summary?month=${month}`);
    const data = await res.json();

    if (!data.calendar) throw new Error("No calendar in response");
    if (typeof data.completedCount !== "number") throw new Error("No completedCount");
    if (typeof data.streak !== "number") throw new Error("No streak");
});

// Test 5: Get sessions
await test("GET /sessions returns session list", async () => {
    const res = await fetch(`${API_BASE}/sessions`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Response is not an array");
    if (data.length === 0) throw new Error("No sessions found");

    const session = data[0];
    if (!session.session_id) throw new Error("Session missing session_id");
    if (!session.session_name) throw new Error("Session missing session_name");
});

// Test 6: Get exercises
await test("GET /exercises returns exercise list", async () => {
    const res = await fetch(`${API_BASE}/exercises?session_id=S1`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Response is not an array");
    if (data.length === 0) throw new Error("No exercises found");

    const exercise = data[0];
    if (!exercise.exercise_id) throw new Error("Exercise missing exercise_id");
    if (!exercise.name) throw new Error("Exercise missing name");
});

// Summary
console.log("\n" + "=".repeat(50));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(50));

if (failed > 0) {
    process.exit(1);
} else {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
}
