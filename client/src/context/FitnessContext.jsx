import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getTodayPlan, getBodyweightHistory, getHeatmap } from "../services/api";
import { notification } from "antd";

const FitnessContext = createContext();

export const useFitness = () => useContext(FitnessContext);

export const FitnessProvider = ({ children }) => {
    const [plan, setPlan] = useState(null);
    const [mode, setMode] = useState(Number(localStorage.getItem("training_mode") || 4));
    const [loading, setLoading] = useState(true);
    const [heatmapData, setHeatmapData] = useState([]);
    const [weightHistory, setWeightHistory] = useState([]);
    const [lastFetch, setLastFetch] = useState(0);

    // Persist mode
    useEffect(() => {
        localStorage.setItem("training_mode", mode);
    }, [mode]);

    const refreshData = useCallback(async (force = false) => {
        // Cache for 5 minutes unless forced
        if (!force && Date.now() - lastFetch < 300000 && plan) return;

        setLoading(true);
        try {
            const [planData, weightData, heatmapObj] = await Promise.all([
                getTodayPlan(mode),
                getBodyweightHistory().catch(() => []),
                getHeatmap().catch(() => ({}))
            ]);

            setPlan(planData);
            setWeightHistory(weightData);

            // Transform heatmap
            const hData = Object.entries(heatmapObj).map(([date, count]) => ({ date, count }));
            setHeatmapData(hData);

            setLastFetch(Date.now());
        } catch (error) {
            console.error("Fetch error:", error);
            notification.error({ message: "Lỗi tải dữ liệu", description: error.message });
        } finally {
            setLoading(false);
        }
    }, [mode, lastFetch, plan]);

    // Initial load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <FitnessContext.Provider value={{
            plan,
            mode,
            setMode,
            loading,
            heatmapData,
            weightHistory,
            refreshData
        }}>
            {children}
        </FitnessContext.Provider>
    );
};
