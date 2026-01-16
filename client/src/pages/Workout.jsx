import React, { useMemo, useState, useCallback, useEffect } from "react";
import { postExerciseCheck, postLog, logBodyweight } from "../services/api";
import { useFitness } from "../context/FitnessContext";
import {
    Card,
    Button,
    Progress,
    Checkbox,
    Typography,
    Space,
    Alert,
    Modal,
    Input
} from "antd";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    FireOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Exercise card component
const ExerciseCard = React.memo(({ ex, idx, checked, onToggle }) => {
    const [showVideo, setShowVideo] = useState(false);

    // Exercise instructions database
    const getInstructions = (name) => {
        const instructions = {
            "Overhead Press": "1. Đứng thẳng, chân rộng bằng vai\n2. Nâng tạ lên ngang vai, lòng bàn tay hướng ra trước\n3. Đẩy tạ thẳng lên trên đầu đến khi tay thẳng hoàn toàn\n4. Hạ tạ chậm rãi về vị trí ban đầu",
            "Bench Press": "1. Nằm ngửa trên ghế, hai chân chống sàn\n2. Nắm tạ rộng hơn vai một chút\n3. Hạ tạ xuống ngực, khuỷu tay giữ góc 45°\n4. Đẩy tạ lên mạnh đến khi tay thẳng",
            "Squats": "1. Đứng thẳng, chân rộng bằng vai\n2. Hạ người xuống như ngồi ghế\n3. Đùi song song với sàn, đầu gối không vượt qua mũi bàn chân\n4. Đứng lên bằng cách đẩy gót chân",
            "Pull-ups": "1. Treo người trên xà, tay rộng hơn vai\n2. Kéo người lên đến khi cằm qua xà\n3. Giữ 1 giây ở trên\n4. Hạ người xuống từ từ",
            "Lateral Raises": "1. Đứng thẳng, hai tay cầm tạ ở hai bên\n2. Nâng tạ lên hai bên đến ngang vai\n3. Khuỷu tay hơi cong nhẹ\n4. Hạ xuống từ từ, kiểm soát chuyển động",
            "Front Raises": "1. Đứng thẳng, cầm tạ trước đùi\n2. Nâng tạ thẳng lên phía trước đến ngang vai\n3. Giữ tay thẳng (hoặc hơi cong)\n4. Hạ xuống chậm rãi",
            "Planks": "1. Chống khuỷu tay, cẳng tay song song\n2. Duỗi thẳng người từ đầu đến chân\n3. Siết cơ bụng, giữ thẳng lưng\n4. Giữ tư thế trong thời gian qui định",
            "Hanging Leg Raises": "1. Treo người trên xà, tay thẳng\n2. Nâng chân lên đến 90° (hoặc cao hơn)\n3. Siết cơ bụng khi nâng\n4. Hạ chân xuống từ từ, không đung đưa",
            "Barbell Rows": "1. Cúi người 45°, lưng thẳng\n2. Nắm tạ rộng hơn vai\n3. Kéo tạ lên về phía ngực\n4. Squeeze cơ lưng ở trên, hạ xuống chậm",
            "Deadlifts": "1. Đứng sát tạ, chân rộng bằng vai\n2. Cúi xuống nắm tạ, lưng thẳng\n3. Đứng lên bằng cách duỗi hông và đầu gối\n4. Hạ xuống theo đường cũ",
            "Leg Curls": "1. Nằm úp trên máy, gót chân để dưới đệm\n2. Gập chân lên đến khi gót chạm mông\n3. Siết cơ đùi sau ở trên\n4. Duỗi chân xuống từ từ",
            "Incline Dumbbell Press": "1. Nằm trên ghế dốc 30-45°\n2. Đẩy tạ lên từ vai đến thẳng tay\n3. Hạ xuống kiểm soát đến ngang ngực\n4. Đẩy lên mạnh",
        };
        return instructions[name] || "Thực hiện động tác theo hướng dẫn của huấn luyện viên hoặc xem video minh họa.";
    };

    const match = ex.video_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const videoId = match ? match[1] : null;

    return (
        <Card
            size="small"
            className="glass hover-lift"
            style={{
                marginBottom: 12,
                borderLeft: checked ? "4px solid #10B981" : "4px solid transparent",
                opacity: checked ? 0.6 : 1,
                transition: "opacity 0.3s"
            }}
            onClick={() => onToggle(ex)}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 16 }}>
                        {idx + 1}. {ex.name}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        4 sets × {ex.reps} reps • {ex.rest_sec}s
                    </Text>
                </div>
                <Checkbox
                    checked={checked}
                    style={{ transform: "scale(1.5)" }}
                />
            </div>

            {/* Animated GIF Demo - From Google Sheets */}
            {ex.animation_url && ex.animation_url.trim() && (
                <div
                    style={{
                        marginTop: 12,
                        textAlign: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                        borderRadius: "8px",
                        padding: "8px",
                        border: "1px solid rgba(0, 0, 0, 0.06)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={ex.animation_url}
                        alt={`${ex.name} animation`}
                        style={{
                            maxWidth: "100%",
                            height: "auto",
                            maxHeight: "300px",
                            borderRadius: "6px",
                            display: "block",
                            margin: "0 auto"
                        }}
                        loading="lazy"
                    />
                </div>
            )}

            {/* Instructions Text */}
            <div style={{
                marginTop: 12,
                padding: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.05)",
                borderRadius: "8px",
                borderLeft: "3px solid #10B981"
            }}
                onClick={(e) => e.stopPropagation()}>
                <Text strong style={{ color: "#10B981", display: "block", marginBottom: 8 }}>
                    📋 Hướng dẫn:
                </Text>
                <Text style={{ whiteSpace: "pre-line", fontSize: 13 }}>
                    {getInstructions(ex.name)}
                </Text>
            </div>

            {/* Collapsible Video */}
            {videoId && (
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="text"
                        size="small"
                        icon={showVideo ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={() => setShowVideo(!showVideo)}
                        style={{ marginTop: 8 }}
                    >
                        {showVideo ? "Ẩn video" : "Xem video"}
                    </Button>

                    {showVideo && (
                        <div
                            style={{
                                marginTop: 8,
                                position: "relative",
                                paddingBottom: "56.25%",
                                height: 0,
                                overflow: "hidden",
                                borderRadius: "8px"
                            }}
                        >
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={ex.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%"
                                }}
                            ></iframe>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
});

ExerciseCard.displayName = "ExerciseCard";

export default function Workout({ onNavigate }) {
    const { plan, mode, refreshData } = useFitness();
    const [checked, setChecked] = useState({});

    // Default stats
    const USER_WEIGHT = 72.5;

    // Check for weekly bodyweight Prompt (Monday)
    useEffect(() => {
        const today = new Date();
        const isMonday = today.getDay() === 1;
        const lastPrompt = localStorage.getItem("last_weight_prompt");
        const todayStr = today.toISOString().slice(0, 10);

        if (isMonday && lastPrompt !== todayStr) {
            let newWeight = USER_WEIGHT;
            Modal.confirm({
                title: "Cập nhật cân nặng đầu tuần",
                content: (
                    <div>
                        <p>Cân nặng hiện tại của bạn là bao nhiêu?</p>
                        <Input
                            defaultValue={USER_WEIGHT}
                            onChange={(e) => newWeight = e.target.value}
                            suffix="kg"
                        />
                    </div>
                ),
                onOk: async () => {
                    await logBodyweight({ date: todayStr, weight: newWeight });
                    localStorage.setItem("last_weight_prompt", todayStr);
                    refreshData(true);
                }
            });
        }
    }, [refreshData]);

    const date = useMemo(
        () => plan?.date ?? new Date().toISOString().slice(0, 10),
        [plan]
    );

    const toggle = useCallback(
        async (ex) => {
            const next = !checked[ex.exercise_id];
            setChecked((c) => ({ ...c, [ex.exercise_id]: next }));

            // Smart Log: 4 sets, Plan Reps, User Weight
            try {
                // Parse reps from string "8-10" -> 10, or "12" -> 12
                const repStr = String(ex.reps).split("-")[1] || String(ex.reps);
                const targetReps = parseInt(repStr) || 10;

                if (next) { // Only log on check, not uncheck (optional)
                    await postExerciseCheck({
                        date,
                        session_id: plan.session.session_id,
                        exercise_id: ex.exercise_id,
                        checked: next,
                        weight: USER_WEIGHT,
                        reps: targetReps, // Log max of range
                        sets: 4 // FIXED as requested
                    });
                }
            } catch (err) {
                console.error("Error logging exercise:", err);
            }
        },
        [checked, date, plan]
    );

    const done = useCallback(async () => {
        if (!plan) return; // Safety check
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
                    onOk: () => {
                        refreshData(true);
                        onNavigate("home");
                    },
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
    }, [checked, plan, date, onNavigate, refreshData]);

    // Early return AFTER all hooks
    if (!plan) return <div style={{ padding: 20 }}>Chưa có lịch tập</div>;

    const completedCount = Object.values(checked).filter(Boolean).length;
    const progress = Math.round((completedCount / plan.exercises.length) * 100);

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
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => onNavigate("home")}
                        style={{ marginBottom: 16 }}
                    >
                        Quay lại Dashboard
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
