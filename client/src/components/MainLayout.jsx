import React, { useState } from "react";
import { Layout, Menu, FloatButton } from "antd";
import {
    HomeOutlined,
    FireOutlined,
    CalendarOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import Dashboard from "../pages/Dashboard";
import Workout from "../pages/Workout";
import Calendar from "../pages/Calendar";
import { useFitness } from "../context/FitnessContext";

const { Content, Footer } = Layout;

export default function MainLayout() {
    const [activeTab, setActiveTab] = useState("home");
    const { refreshData, loading } = useFitness();

    const renderContent = () => {
        // We use display:none to keep components mounted (preserving scroll & state)
        return (
            <>
                <div style={{ display: activeTab === "home" ? "block" : "none" }}>
                    <Dashboard onNavigate={setActiveTab} />
                </div>
                <div style={{ display: activeTab === "workout" ? "block" : "none" }}>
                    <Workout onNavigate={setActiveTab} />
                </div>
                <div style={{ display: activeTab === "calendar" ? "block" : "none" }}>
                    <Calendar />
                </div>
            </>
        );
    };

    const menuItems = [
        { key: "home", icon: <HomeOutlined />, label: "Home" },
        { key: "workout", icon: <FireOutlined />, label: "Workout" },
        { key: "calendar", icon: <CalendarOutlined />, label: "Calendar" },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Menu
                mode="horizontal"
                selectedKeys={[activeTab]}
                onClick={(e) => setActiveTab(e.key)}
                items={menuItems}
                style={{
                    position: "sticky",
                    top: 0,
                    width: "100%",
                    justifyContent: "center",
                    borderBottom: "1px solid #f0f0f0",
                    zIndex: 1000,
                    height: 64,
                    lineHeight: "64px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
            />

            <Content>
                {renderContent()}
            </Content>

            <FloatButton
                icon={<ReloadOutlined spin={loading} />}
                type="default"
                style={{ right: 24, bottom: 24 }}
                onClick={() => refreshData(true)}
            />
        </Layout>
    );
}
