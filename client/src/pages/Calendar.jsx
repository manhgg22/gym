import React, { useEffect, useState } from "react";
import { getMonthSummary } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Statistic,
    Row,
    Col,
    Calendar as AntCalendar,
    Typography,
    Spin,
    Alert,
    Space,
} from "antd";
import {
    ArrowLeftOutlined,
    LeftOutlined,
    RightOutlined,
    WarningOutlined,
    FireOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function Calendar() {
    const navigate = useNavigate();
    const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getMonthSummary(month)
            .then(setSummary)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [month]);

    const changeMonth = (delta) => {
        const d = dayjs(month + "-01").add(delta, "month");
        setMonth(d.format("YYYY-MM"));
    };

    const getWarnings = () => {
        if (!summary) return [];
        const warnings = [];

        const daysInMonth = dayjs(month + "-01").daysInMonth();
        const expectedWorkouts = Math.floor(daysInMonth * 0.5);
        if (summary.completedCount < expectedWorkouts) {
            warnings.push({
                type: "warning",
                message: `Bạn chỉ tập ${summary.completedCount}/${daysInMonth} ngày trong tháng. Nên tập ít nhất ${expectedWorkouts} ngày!`,
            });
        }

        if (summary.restStreak && summary.restStreak > 3) {
            warnings.push({
                type: "error",
                message: `Bạn đã nghỉ ${summary.restStreak} ngày liên tiếp! Hãy quay lại tập luyện.`,
            });
        }

        return warnings;
    };

    const dateCellRender = (value) => {
        if (!summary) return null;

        const dateStr = value.format("YYYY-MM-DD");
        const today = dayjs().format("YYYY-MM-DD");
        const logForDay = summary.calendar.find((c) => c.date === dateStr);

        if (value.format("YYYY-MM") !== month || dateStr > today) {
            return null;
        }

        const dayNumber = value.format("DD");

        if (logForDay && logForDay.completed) {
            return (
                <div
                    style={{
                        background: "linear-gradient(135deg, #10B981, #059669)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "14px",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {dayNumber}
                </div>
            );
        } else {
            return (
                <div
                    style={{
                        background: "linear-gradient(135deg, #EF4444, #DC2626)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "14px",
                        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {dayNumber}
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", minHeight: "100vh" }}>
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "40px", minHeight: "100vh" }}>
                <Alert message="Lỗi" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!summary) return null;

    const warnings = getWarnings();

    return (
        <div
            style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: window.innerWidth <= 768 ? "16px" : "24px",
                minHeight: "100vh",
            }}
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Header */}
                <div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/")}
                        style={{ marginBottom: 16 }}
                    >
                        Quay lại
                    </Button>
                    <Title level={2}>Lịch tập tháng</Title>
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {warnings.map((warning, idx) => (
                            <Alert
                                key={idx}
                                message={warning.message}
                                type={warning.type}
                                showIcon
                                icon={<WarningOutlined />}
                            />
                        ))}
                    </Space>
                )}

                {/* Stats Cards */}
                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Card className="glass hover-lift">
                            <Statistic
                                title="Buổi tập"
                                value={summary.completedCount}
                                suffix="buổi"
                                prefix={<FireOutlined style={{ color: "#EF4444" }} />}
                                valueStyle={{
                                    color: "#EF4444",
                                    fontFamily: "Courier New, monospace",
                                }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card className="glass hover-lift">
                            <Statistic
                                title="Streak"
                                value={summary.streak}
                                suffix="ngày"
                                prefix={<TrophyOutlined style={{ color: summary.streak >= 7 ? "#10B981" : "#F97316" }} />}
                                valueStyle={{
                                    color: summary.streak >= 7 ? "#10B981" : "#F97316",
                                    fontFamily: "Courier New, monospace",
                                }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card className="glass hover-lift">
                            <Statistic
                                title="Nghỉ liên tiếp"
                                value={summary.restStreak || 0}
                                suffix="ngày"
                                prefix={<ClockCircleOutlined style={{ color: (summary.restStreak || 0) > 3 ? "#EF4444" : "#10B981" }} />}
                                valueStyle={{
                                    color: (summary.restStreak || 0) > 3 ? "#EF4444" : "#10B981",
                                    fontFamily: "Courier New, monospace",
                                }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Calendar Card */}
                <Card className="glass">
                    <div
                        style={{
                            marginBottom: 16,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Button icon={<LeftOutlined />} onClick={() => changeMonth(-1)} />
                        <Title level={4} style={{ margin: 0 }}>
                            {month}
                        </Title>
                        <Button icon={<RightOutlined />} onClick={() => changeMonth(1)} />
                    </div>

                    <AntCalendar
                        fullscreen={false}
                        value={dayjs(month + "-01")}
                        onSelect={(date) => setMonth(date.format("YYYY-MM"))}
                        fullCellRender={(value) => {
                            const dateStr = value.format("YYYY-MM-DD");
                            const today = dayjs().format("YYYY-MM-DD");
                            const logForDay = summary?.calendar.find((c) => c.date === dateStr);
                            const dayNumber = value.format("DD");

                            let bgColor = "transparent";
                            let textColor = "inherit";

                            // Only color past dates in current month
                            if (value.format("YYYY-MM") === month && dateStr <= today) {
                                if (logForDay && logForDay.completed) {
                                    // Workout day - green
                                    bgColor = "linear-gradient(135deg, #10B981, #059669)";
                                    textColor = "white";
                                } else {
                                    // Rest day - red
                                    bgColor = "linear-gradient(135deg, #EF4444, #DC2626)";
                                    textColor = "white";
                                }
                            }

                            return (
                                <div
                                    className="ant-picker-cell-inner"
                                    style={{
                                        background: bgColor,
                                        color: textColor,
                                        borderRadius: "6px",
                                        padding: "6px",
                                        minHeight: "32px",
                                        maxWidth: "40px",
                                        margin: "0 auto",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: bgColor !== "transparent" ? "bold" : "normal",
                                        fontSize: "13px",
                                        boxShadow: bgColor !== "transparent" ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "none",
                                    }}
                                >
                                    {dayNumber}
                                </div>
                            );
                        }}
                    />
                </Card>

                {/* Legend */}
                <Card size="small" className="glass">
                    <Space size="large">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    background: "linear-gradient(135deg, #10B981, #059669)",
                                    borderRadius: 4,
                                    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                                }}
                            ></div>
                            <Text>Đã tập</Text>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    background: "linear-gradient(135deg, #EF4444, #DC2626)",
                                    borderRadius: 4,
                                    boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)",
                                }}
                            ></div>
                            <Text>Nghỉ</Text>
                        </div>
                    </Space>
                </Card>
            </Space>
        </div>
    );
}
