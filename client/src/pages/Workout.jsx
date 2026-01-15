import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getTodayPlan, postExerciseCheck, postLog } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Progress,
    Checkbox,
    Typography,
    Space,
    Spin,
    Alert,
    Modal,
    Row,
    Col,
} from "antd";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    FireOutlined,
    TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// Video player component
const VideoPlayer = React.memo(({ url }) => {
    if (!url || !url.trim()) return null;

    const getYouTubeId = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        return match ? match[1] : null;
    };

    const videoId = getYouTubeId(url);

    if (videoId) {
        return (
            <div className="video-embed">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Exercise video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                ></iframe>
            </div>
        );
    }

    return (
        <Button type="link" href={url} target="_blank" rel="noreferrer">
            Xem video
        </Button>
    );
});

VideoPlayer.displayName = "VideoPlayer";

// Exercise card component
const ExerciseCard = React.memo(({ ex, idx, checked, onToggle }) => {
    const [videoVisible, setVideoVisible] = useState(false);

    const getVietnameseDescription = (name) => {
        const descriptions = {
            "Bench Press": "Nằm đẩy tạ - Tập ngực, vai trước, tay sau",
            "Incline Dumbbell Press": "Đẩy tạ đơn dốc lên - Tập ngực trên",
            "Cable Flyes": "Kéo cáp ngực - Tập cơ ngực giữa",
            "Tricep Dips": "Chống đẩy song song - Tập tay sau",
            "Overhead Tricep Extension": "Duỗi tay sau qua đầu",
            "Pull-ups": "Kéo xà đơn - Tập lưng và tay trước",
            "Barbell Rows": "Chèo tạ đòn - Tập lưng giữa",
            "Lat Pulldown": "Kéo xà lat - Tập lưng xô",
            "Barbell Curls": "Cuốn tạ đòn - Tập bắp tay",
            "Hammer Curls": "Cuốn búa - Tập cơ cẳng tay",
            "Overhead Press": "Đẩy tạ qua đầu - Tập vai",
            "Lateral Raises": "Nâng tạ sang ngang - Tập vai giữa",
            "Front Raises": "Nâng tạ lên trước - Tập vai trước",
            "Planks": "Chống tay tĩnh - Tập bụng",
            "Hanging Leg Raises": "Nâng chân treo xà - Tập bụng dưới",
            "Squats": "Squat - Tập đùi và mông",
            "Romanian Deadlifts": "Deadlift kiểu Romania - Tập đùi sau",
            "Leg Press": "Đạp chân máy - Tập đùi",
            "Leg Curls": "Cuốn chân - Tập đùi sau",
            "Calf Raises": "Nhón bắp chân",
            "Tricep Pushdowns": "Đẩy tay sau xuống - Tập tay sau",
        };
        return descriptions[name] || "";
    };

    const vnDescription = getVietnameseDescription(ex.name);

    return (
        <Card
            size="small"
            className="glass hover-lift"
            style={{
                marginBottom: 12,
                borderLeft: checked ? "4px solid #10B981" : "4px solid transparent",
            }}
        >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                        <Text
                            strong
                            style={{
                                fontSize: 16,
                                display: "block",
                                marginBottom: 4,
                            }}
                        >
                            {idx + 1}. {ex.name}
                        </Text>
                        {vnDescription && (
                            <Text type="success" style={{ fontSize: 13, display: "block" }}>
                                {vnDescription}
                            </Text>
                        )}
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                fontFamily: "Courier New, monospace",
                                display: "block",
                                marginTop: 4,
                            }}
                        >
                            {ex.sets} sets × {ex.reps} reps • {ex.rest_sec}s rest
                        </Text>
                    </div>
                    <Checkbox
                        checked={checked}
                        onChange={() => onToggle(ex)}
                        style={{ marginLeft: 12 }}
                    />
                </div>

                {ex.video_url && ex.video_url.trim() && (
                    <>
                        <Button
                            size="small"
                            icon={<PlayCircleOutlined />}
                            onClick={() => setVideoVisible(!videoVisible)}
                            type={videoVisible ? "default" : "primary"}
                        >
                            {videoVisible ? "Ẩn video" : "Xem video"}
                        </Button>
                        {videoVisible && <VideoPlayer url={ex.video_url} />}
                    </>
                )}
            </Space>
        </Card>
    );
});

ExerciseCard.displayName = "ExerciseCard";

export default function Workout() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const mode = Number(params.get("mode") || 4);

    const [plan, setPlan] = useState(null);
    const [checked, setChecked] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const date = useMemo(
        () => plan?.date ?? new Date().toISOString().slice(0, 10),
        [plan]
    );

    useEffect(() => {
        setLoading(true);
        setError(null);
        getTodayPlan(mode)
            .then((p) => {
                setPlan(p);
                setChecked({});
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [mode]);

    const toggle = useCallback(
        async (ex) => {
            const next = !checked[ex.exercise_id];
            setChecked((c) => ({ ...c, [ex.exercise_id]: next }));
            try {
                await postExerciseCheck({
                    date,
                    session_id: plan.session.session_id,
                    exercise_id: ex.exercise_id,
                    checked: next,
                });
            } catch (err) {
                console.error("Error logging exercise check:", err);
            }
        },
        [checked, date, plan]
    );

    const done = useCallback(async () => {
        const completedCount = Object.values(checked).filter(Boolean).length;
        const totalCount = plan.exercises.length;

        const finishWorkout = async () => {
            try {
                await postLog({
                    date,
                    session_id: plan.session.session_id,
                    completed: true,
                    duration_min: "",
                    note: "",
                });
                Modal.success({
                    content: "Tuyệt vời! Buổi tập đã được lưu!",
                    onOk: () => navigate("/"),
                });
            } catch (err) {
                Modal.error({ content: "Lỗi khi lưu: " + err.message });
            }
        };

        if (completedCount < totalCount) {
            Modal.confirm({
                title: "Xác nhận",
                content: `Bạn mới hoàn thành ${completedCount}/${totalCount} bài. Vẫn muốn kết thúc?`,
                onOk: finishWorkout,
            });
        } else {
            await finishWorkout();
        }
    }, [checked, plan, date, navigate]);

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

    if (!plan) return null;

    const completedCount = Object.values(checked).filter(Boolean).length;
    const progress = Math.round((completedCount / plan.exercises.length) * 100);

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
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <FireOutlined style={{ fontSize: 32, color: "#EF4444" }} />
                        <div>
                            <Title level={2} style={{ margin: 0 }}>
                                {plan.session.session_name}
                            </Title>
                            <Text type="secondary">{plan.session.muscle_groups}</Text>
                        </div>
                    </div>
                </div>

                {/* Progress Card */}
                <Card className="glass">
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text strong>Tiến độ</Text>
                            <Text
                                strong
                                style={{
                                    fontFamily: "Courier New, monospace",
                                    fontSize: 18,
                                    color: progress === 100 ? "#10B981" : "#EF4444",
                                }}
                            >
                                {completedCount}/{plan.exercises.length}
                            </Text>
                        </div>
                        <Progress
                            percent={progress}
                            status={progress === 100 ? "success" : "active"}
                            strokeColor={{
                                "0%": "#EF4444",
                                "100%": "#F97316",
                            }}
                            showInfo={false}
                        />
                    </Space>
                </Card>

                {/* Exercises List */}
                <div>
                    {plan.exercises.map((ex, idx) => (
                        <ExerciseCard
                            key={ex.exercise_id}
                            ex={ex}
                            idx={idx}
                            checked={!!checked[ex.exercise_id]}
                            onToggle={toggle}
                        />
                    ))}
                </div>

                {/* Finish Button */}
                <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    onClick={done}
                    block
                    style={{
                        height: 56,
                        fontSize: 18,
                        fontWeight: 700,
                    }}
                >
                    Hoàn thành buổi tập
                </Button>
            </Space>
        </div>
    );
}
