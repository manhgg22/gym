import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Spin } from "antd";
import ThemeProvider from "./components/ThemeProvider";
import Dashboard from "./pages/Dashboard";

// Lazy load pages
const Workout = lazy(() => import("./pages/Workout"));
const Calendar = lazy(() => import("./pages/Calendar"));

// Loading component
const PageLoader = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
        <Spin size="large" tip="Đang tải..." />
    </div>
);

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/workout" element={<Workout />} />
                        <Route path="/calendar" element={<Calendar />} />
                    </Routes>
                </Suspense>
            </Router>
        </ThemeProvider>
    );
}

export default App;
