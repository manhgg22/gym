import React, { useState } from "react";
import { quickCheckin } from "../services/api";
import { useFitness } from "../context/FitnessContext";
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
    notification,
} from "antd";
import {
    PlayCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    FireOutlined,
    TrophyOutlined,
    WarningOutlined,
    LineChartOutlined
} from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const { Title, Text } = Typography;

export default function Dashboard({ onNavigate }) {
    const { plan, mode, setMode, loading, heatmapData, weightHistory, refreshData } = useFitness();
    const [checking, setChecking] = useState(false);

    const handleQuickCheckin = async () => {
        setChecking(true);
        try {
            const result = await quickCheckin(mode);
            await refreshData(true);

            notification.success({
                message: 'Check-in thành công!',
                description: `Buổi tập: ${result.session.session_name}`,
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                placement: 'topRight',
            });
        } catch (err) {
            notification.error({
                message: 'Lỗi',
                description: err.message,
                placement: 'topRight',
            });
        } finally {
            setChecking(false);
        }
    };

    if (loading && !plan) {
        return (
            <div style={{ padding: "40px", textAlign: "center", minHeight: "100vh" }}>
                <Spin size="large" tip="Đang tải..." />
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
                                <Button
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    size="large"
                                    block
                                    onClick={() => onNavigate("workout")}
                                >
                                    Bắt đầu tập
                                </Button>
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

                {/* Heatmap & Weight Chart */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Card title={<Space><CalendarOutlined /> Phong độ tập luyện</Space>} className="glass">
                            <div style={{ height: 150 }}>
                                <CalendarHeatmap
                                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                    endDate={new Date()}
                                    values={heatmapData}
                                    classForValue={(value) => {
                                        if (!value) return 'color-empty';
                                        return `color-scale-${Math.min(value.count, 4)}`;
                                    }}
                                    tooltipDataAttrs={value => ({
                                        'data-tip': value.date ? `${value.date}: Đã tập` : 'Nghỉ'
                                    })}
                                    showWeekdayLabels
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card title={<Space><LineChartOutlined /> Biểu đồ cân nặng</Space>} className="glass">
                            <div style={{ width: '100%', height: 200 }}>
                                <ResponsiveContainer>
                                    <LineChart data={weightHistory}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(t) => t.slice(5)} />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8 }} />
                                        <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
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
                <Button
                    type="default"
                    icon={<CalendarOutlined />}
                    size="large"
                    block
                    onClick={() => onNavigate("calendar")}
                    style={{ marginBottom: 40 }}
                >
                    Xem lịch tháng
                </Button>
            </Space>
        </div>
    );
}
