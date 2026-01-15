import React, { useEffect, useState } from "react";
import { getTodayPlan, quickCheckin } from "../services/api";
import { Link } from "react-router-dom";
import {
    Card,
    Button,
    Segmented,
    Typography,
    List,
    Spin,
    Alert,
    Space,
    Row,
    Col,
    Statistic,
    Progress,
    notification,
} from "antd";
import {
    PlayCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    FireOutlined,
    TrophyOutlined,
    WarningOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function Dashboard() {
    const [plan, setPlan] = useState(null);
    const [mode, setMode] = useState(4);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getTodayPlan(mode)
            .then(setPlan)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [mode]);

    const handleQuickCheckin = async () => {
        setChecking(true);
        try {
            const result = await quickCheckin(mode);
            setPlan(null);
            setTimeout(() => getTodayPlan(mode).then(setPlan), 300);

            // Success notification
            notification.success({
                message: 'Check-in thành công!',
                description: `Buổi tập: ${result.session.session_name}`,
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                placement: 'topRight',
                duration: 3,
            });
        } catch (err) {
            // Error notification
            if (err.message && err.message.includes("đã tập rồi")) {
                notification.error({
                    message: 'Không thể check-in!',
                    description: 'Bạn đã tập rồi hôm nay! Mỗi ngày chỉ được tập 1 buổi.',
                    icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
                    placement: 'topRight',
                    duration: 5,
                });
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: err.message,
                    placement: 'topRight',
                    duration: 4,
                });
            }
        } finally {
            setChecking(false);
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
                <Alert
                    message="Lỗi kết nối"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    if (!plan) return null;

    const today = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

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
                    <Title level={1} style={{ marginBottom: 8 }}>
                        Workout Tracker
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        {today}
                    </Text>
                </div>

                {/* Mode Selector */}
                <Segmented
                    options={[
                        { label: "4 buổi/tuần", value: 4 },
                        { label: "5 buổi/tuần", value: 5 },
                    ]}
                    value={mode}
                    onChange={setMode}
                    block
                    size="large"
                />

                {/* Hero Card - Today's Workout */}
                <Card
                    className="glass hover-lift"
                    style={{
                        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))",
                        borderColor: "rgba(239, 68, 68, 0.3)",
                    }}
                >
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <FireOutlined style={{ fontSize: 32, color: "#EF4444" }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 14 }}>
                                    HÔM NAY
                                </Text>
                                <Title level={2} style={{ margin: 0 }}>
                                    {plan.session.session_name}
                                </Title>
                            </div>
                        </div>

                        <Row gutter={16}>
                            <Col span={12}>
                                <div>
                                    <Text type="secondary">Nhóm cơ</Text>
                                    <div>
                                        <Text strong style={{ fontSize: 16 }}>
                                            {plan.session.muscle_groups}
                                        </Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <Text type="secondary">Số bài tập</Text>
                                    <div>
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 24,
                                                fontFamily: "Courier New, monospace",
                                                color: "#EF4444",
                                            }}
                                        >
                                            {plan.exercises.length}
                                        </Text>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col span={12}>
                                <Link to={`/workout?mode=${mode}`} style={{ width: "100%" }}>
                                    <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
                                        size="large"
                                        block
                                    >
                                        Bắt đầu tập
                                    </Button>
                                </Link>
                            </Col>
                            <Col span={12}>
                                <Button
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleQuickCheckin}
                                    loading={checking}
                                    size="large"
                                    block
                                >
                                    Check-in
                                </Button>
                            </Col>
                        </Row>
                    </Space>
                </Card>

                {/* Quick Stats */}
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Card className="glass hover-lift">
                            <Statistic
                                title="Chế độ tập"
                                value={mode}
                                suffix="buổi/tuần"
                                prefix={<TrophyOutlined style={{ color: "#F97316" }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Card className="glass hover-lift">
                            <Statistic
                                title="Bài tập hôm nay"
                                value={plan.exercises.length}
                                suffix="bài"
                                prefix={<FireOutlined style={{ color: "#EF4444" }} />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Tips Card */}
                <Card title="💡 Tips nhanh" className="glass">
                    <List
                        size="small"
                        dataSource={plan.tips}
                        renderItem={(tip) => (
                            <List.Item style={{ borderBottom: "1px solid rgba(203, 213, 225, 0.1)" }}>
                                <Text>{tip}</Text>
                            </List.Item>
                        )}
                    />
                </Card>

                {/* Quick Actions */}
                <Link to="/calendar">
                    <Button
                        type="default"
                        icon={<CalendarOutlined />}
                        size="large"
                        block
                    >
                        Xem lịch tháng
                    </Button>
                </Link>
            </Space>
        </div>
    );
}
