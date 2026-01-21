import dotenv from "dotenv";
import { addTimelineEvent, addDream, sendMail } from "./services/love.js";

dotenv.config();

async function seed() {
    console.log("🌱 Seeding Sample Data...");

    try {
        // Timeline
        console.log("Adding Timeline Events...");
        await addTimelineEvent("2024-02-14", "Lần đầu gặp gỡ", "Ngày định mệnh chúng ta va vào nhau tại quán cà phê góc phố. Em mặc váy trắng, còn anh thì ngại ngùng không dám bắt chuyện.", "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000&auto=format&fit=crop");
        await addTimelineEvent("2024-03-08", "Buổi hẹn đầu tiên", "Chúng mình cùng đi xem phim và ăn tối. Anh nhớ mãi nụ cười của em lúc nhận bó hoa hồng.", "https://images.unsplash.com/photo-1517867065872-c70f903d2b2c?q=80&w=1000&auto=format&fit=crop");
        await addTimelineEvent("2024-06-20", "Chuyến đi Đà Lạt", "Chuyến du lịch xa đầu tiên cùng nhau. Săn mây lúc 4h sáng, lạnh nhưng ấm áp lạ thường vì có em bên cạnh.", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop");
        await addTimelineEvent("2024-12-25", "Giáng sinh ấm áp", "Cùng nhau trang trí cây thông và tặng nhau những món quà ý nghĩa. Mùa đông không lạnh nữa.", "https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=1000&auto=format&fit=crop");

        // Dreams
        console.log("Adding Dream List...");
        await addDream("Cùng nhau ngắm hoàng hôn ở Phú Quốc", "https://images.unsplash.com/photo-1516216628259-2224075b95ba?q=80&w=1000");
        await addDream("Nuôi một chú mèo tên Bơ");
        await addDream("Học làm bánh kem tặng nhau dịp sinh nhật");
        await addDream("Du lịch Châu Âu năm 30 tuổi");

        // Mailbox
        console.log("Adding Love Letters...");
        await sendMail("Romeo", "Gửi em người yêu bé nhỏ", "Chào buổi sáng công chúa của anh. Chúc em một ngày làm việc thật vui vẻ và tràn đầy năng lượng nhé. Yêu em nhiều!");
        await sendMail("Juliet", "Nhớ anh quá đi", "Anh ơi bao giờ anh về? Em làm món sườn xào chua ngọt anh thích rồi nè. Về sớm nha!");

        console.log("✅ Seeding Completed! Refresh page to see changes.");
    } catch (error) {
        console.error("❌ Seeding Failed:", error);
    }
}

seed();
