import { useState, useEffect, useRef, useMemo } from 'react';
import { FaHeart, FaPen, FaArrowDown, FaEnvelope, FaCheck } from 'react-icons/fa';
import { TbVinyl } from "react-icons/tb";
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const API_BASE = import.meta.env.PROD ? 'https://inkverse.online/api/love' : 'http://localhost:4000/love';
const IS_DEV = import.meta.env.DEV;

// --- ANIMATED COMPONENTS ---

const ParallaxHeart = ({ speed = 1, top, left, size, color = "text-pink-200" }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 2000], [0, speed * 200]);
  const swayDuration = 3 + Math.random() * 5;
  const swayDelay = Math.random() * 2;

  return (
    <motion.div
      style={{ y, top, left, fontSize: size }}
      animate={{ x: [-20, 20, -20], rotate: [-10, 10, -10] }}
      transition={{ duration: swayDuration, repeat: Infinity, ease: "easeInOut", delay: swayDelay }}
      className={`absolute pointer-events-none z-0 opacity-60 ${color}`}
    >
      <FaHeart />
    </motion.div>
  );
};

// 1. HERO
const HeroSection = ({ days, names, quote, startDate }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.5], ["0px", "10px"]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const details = useMemo(() => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let dayDiff = now.getDate() - start.getDate();
    if (dayDiff < 0) { months--; dayDiff += 30; }
    if (months < 0) { years--; months += 12; }
    return `${years} Năm ${months} Tháng ${dayDiff} Ngày`;
  }, [startDate]);

  return (
    <section ref={ref} className="h-screen flex flex-col items-center justify-center relative sticky top-0 z-0">
      <motion.div style={{ scale, opacity, filter: blur, y }} className="text-center z-10 w-full px-4">
        <h1 className="text-3xl font-light text-gray-600 mb-8 flex items-center justify-center gap-3">
          {names.male} <FaHeart className="text-red-500 text-xl animate-pulse" /> {names.female}
        </h1>
        <div className="relative mb-6">
          <div className="text-[10rem] md:text-[14rem] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-red-500 drop-shadow-sm select-none">
            {days}
          </div>
          <p className="text-xl font-medium text-gray-400 tracking-[0.2em] uppercase mt-2">Days in Love</p>
          <p className="text-pink-400 font-medium mt-4 text-lg bg-pink-50 inline-block px-4 py-2 rounded-full border border-pink-100">{details}</p>
        </div>
        {quote && (
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 max-w-md mx-auto shadow-sm mt-8">
            <p className="text-lg italic text-gray-600 font-serif">"{quote.quote}"</p>
            <p className="text-xs font-bold text-pink-400 mt-3">— {quote.author}</p>
          </div>
        )}
      </motion.div>
      <motion.div style={{ opacity }} animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 text-pink-300">
        <FaArrowDown className="mx-auto" />
      </motion.div>
    </section>
  );
};

// HELPER: Generate Wavy Path
const WavyString = ({ count }) => {
  // Card width = 500, Gap = 80 (approx rem to px conversion) -> 5rem gap ~ 80px
  // Using explicit rem-based sizing logic for consistency with Tailwind
  // min-w-[500px] + gap-20 (5rem = 80px). Total stride = 580px.
  // Center of first card: 500/2 = 250px.
  // Intro section width: min-w-[400px] + pl-10 (40px) = 440px? 
  // Wait, the flex container has `pl-10`. The first item is Intro (400px). Then gap 80px. Then Card 1.
  // So Card 1 center starts at: 40px (pl) + 400px (intro) + 80px (gap) + 250px (half card) = 770px.
  // Stride is 580px.

  // We want the line to start from Center of Card 1.
  if (count < 2) return null;

  const startX = 770;
  const stride = 580;
  const points = [];

  for (let i = 0; i < count; i++) {
    points.push(startX + i * stride);
  }

  // Construct Path
  // M x0 y0 C cp1x cp1y, cp2x cp2y, x1 y1 ...
  let path = `M ${points[0]} 300`; // Start at middle Y (approx 60vh/2 = 300px? Box height is 60vh ~ 400-500px?)

  // Let's assume height center is roughly 300px relative to the container `pt-10`.

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const mid = (current + next) / 2;

    // Control points for a "drooping" string effect
    // It goes down and then up
    path += ` C ${current + 100} 450, ${next - 100} 450, ${next} 300`;
  }

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0" style={{ minWidth: `${startX + count * stride}px` }}>
      <path d={path} fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="10, 5" strokeLinecap="round" className="opacity-60" />
      {/* Dots at connection points */}
      {points.map((x, i) => (
        <circle key={i} cx={x} cy="300" r="6" fill="#f472b6" />
      ))}
    </svg>
  );
}


// 2. HORIZONTAL TIMELINE
const HorizontalTimeline = ({ timeline }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 });
  const x = useTransform(smoothProgress, [0, 1], ["5%", "-95%"]);

  return (
    <section ref={targetRef} className="relative h-[400vh] z-20">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#fff0f3]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100/50 via-white to-white opacity-80 pointer-events-none"></div>

        <motion.div style={{ x }} className="flex gap-20 pl-10 items-center h-full relative z-10 will-change-transform pt-10">

          {/* WAVY SVG CONNECTOR */}
          <WavyString count={timeline.length} />

          {/* Intro */}
          <div className="min-w-[400px] flex-shrink-0 pl-10 relative z-10">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <span className="text-pink-500 text-sm font-bold tracking-widest uppercase mb-4 block">Chương 1</span>
              <h2 className="text-6xl font-bold text-gray-800 leading-tight">Hành Trình<br />Của Chúng Mình</h2>
              <p className="mt-6 text-gray-500 text-lg max-w-xs">Kéo xuống để xem lại những thước phim kỷ niệm...</p>
              <div className="mt-8 text-4xl text-pink-300 animate-bounce-x">→</div>
            </motion.div>
          </div>

          {/* Events */}
          {timeline.map((event, idx) => (
            <motion.div
              key={idx}
              className="relative min-w-[500px] h-[60vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col group border-[8px] border-white z-10"
              whileHover={{ y: -30, rotate: 1, scale: 1.02, transition: { type: "spring" } }}
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ margin: "-10% 0px -10% 0px" }}
            >
              {/* Pin visual */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-4 h-4 rounded-full bg-pink-400 shadow-md z-20"></div>

              <div className="absolute top-4 right-6 text-9xl font-black text-gray-100 z-0 select-none opacity-50">{idx + 1}</div>

              <div className="h-3/5 overflow-hidden relative">
                <motion.img
                  src={event.image_url || "https://source.unsplash.com/random/800x600/?love"}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1 p-8 relative z-10 bg-white flex flex-col justify-center">
                <span className="inline-block self-start bg-pink-50 text-pink-600 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-pink-100">
                  {event.date}
                </span>
                <h3 className="text-3xl font-bold text-gray-800 mb-3 line-clamp-2">{event.title}</h3>
                <p className="text-gray-500 text-base leading-relaxed line-clamp-3">{event.description}</p>
              </div>
            </motion.div>
          ))}

          <div className="min-w-[400px] flex-shrink-0 flex items-center justify-center p-10 relative z-10">
            <div className="text-2xl font-bold text-gray-300 bg-white/50 px-8 py-4 rounded-full border border-gray-100">Còn tiếp...</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// 3. DREAM LIST
const DreamCanvas = ({ dreams }) => {
  return (
    <section className="min-h-screen py-32 px-6 relative z-30 bg-[#f0fff4]">
      <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-green-50/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none"></div>
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 text-center">
          <span className="text-green-500 text-sm font-bold tracking-widest uppercase mb-2 block">Chương 2</span>
          <h2 className="text-5xl font-bold text-gray-800">Những Điều Muốn Làm</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dreams.map((dream, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring" }}
              whileHover={{ y: -10, rotate: idx % 2 === 0 ? 1 : -1 }}
              className={`p-8 rounded-[2.5rem] bg-white shadow-xl border-4 flex flex-col justify-between min-h-[200px] ${dream.is_completed === 'TRUE' ? 'border-green-100 bg-green-50 opacity-80' : 'border-white'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${dream.is_completed === 'TRUE' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    {dream.is_completed === 'TRUE' ? <FaCheck /> : <span className="text-xs font-bold text-gray-400">TODO</span>}
                  </div>
                  <span className="text-gray-200 font-black text-5xl select-none">0{idx + 1}</span>
                </div>
                <p className={`text-xl font-bold leading-snug ${dream.is_completed === 'TRUE' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {dream.task}
                </p>
              </div>
              {dream.is_completed === 'TRUE' && <span className="mt-4 text-xs font-bold text-green-600 uppercase tracking-widest">Đã hoàn thành</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. MAILBOX
const MailboxSection = ({ mail }) => {
  return (
    <section className="min-h-screen py-32 px-6 bg-[#fff0f3] relative z-30 overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-20 text-center">
          <span className="text-purple-500 text-sm font-bold tracking-widest uppercase mb-2 block">Chương 3</span>
          <h2 className="text-5xl font-bold text-gray-800">Hộp Thư Tình Yêu</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="sticky top-40">
            <motion.div
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden cursor-pointer group"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <FaPen className="text-6xl mb-8 opacity-90 relative z-10" />
              <h3 className="text-3xl font-bold mb-4 relative z-10">Gửi tâm thư</h3>
              <p className="opacity-90 text-lg mb-8 relative z-10">Gửi những lời yêu thương bí mật...</p>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md absolute bottom-8 right-8 group-hover:bg-white group-hover:text-purple-500 transition-all">
                <span className="text-2xl">✍️</span>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {mail.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, translateX: -10 }}
                className="bg-white p-10 rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-lg rounded-br-lg shadow-xl border border-purple-50 relative group"
              >
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-100 group-hover:text-pink-500 transition-all transform group-hover:rotate-12">
                  <FaEnvelope size={40} />
                </div>
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 font-bold text-xl">{m.sender.charAt(0)}</div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">From {m.sender}</div>
                    <div className="text-sm font-bold text-gray-800">{new Date(m.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4">{m.title}</h4>
                <p className="text-gray-600 leading-relaxed font-serif text-lg italic bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
                  "{m.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// --- MAIN APP ---

function App() {
  const [locked, setLocked] = useState(() => {
    if (IS_DEV) return false;
    return !sessionStorage.getItem('love_unlocked');
  });

  const [config, setConfig] = useState(null);
  const [days, setDays] = useState(0);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const [quote, setQuote] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [dreams, setDreams] = useState([]);
  const [mail, setMail] = useState([]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchConfig();
    if (!locked) fetchData();
  }, [locked]);

  const fetchConfig = () => {
    fetch(`${API_BASE}/config`).then(res => res.json()).then(data => {
      setConfig(data);
      if (data.start_date) {
        const start = new Date(data.start_date);
        const now = new Date();
        const diff = now - start;
        setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
      }
    });
  };

  const unlock = () => {
    const validPass = config?.passcode || "20032025";
    if (passcode === validPass) {
      setLocked(false); sessionStorage.setItem('love_unlocked', 'true'); fetchData();
    } else { setError("Sai mật khẩu rồi người yêu ơi!"); }
  };

  const fetchData = () => {
    fetch(`${API_BASE}/quote`).then(r => r.json()).then(setQuote);
    fetch(`${API_BASE}/timeline`).then(r => r.json()).then(setTimeline);
    fetch(`${API_BASE}/dreamlist`).then(r => r.json()).then(setDreams);
    fetch(`${API_BASE}/mailbox`).then(r => r.json()).then(setMail);
  };

  if (!config) return <div className="h-screen flex items-center justify-center text-pink-500 font-medium">Đang tải tình yêu...</div>;

  if (locked) {
    return (
      <div className="h-screen bg-pink-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
          {[...Array(15)].map((_, i) => (
            <ParallaxHeart key={i} top={`${Math.random() * 100}%`} left={`${Math.random() * 100}%`} size={20 + Math.random() * 50} speed={Math.random() > 0.5 ? 1 : -1} />
          ))}
        </div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/90 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center z-10 border border-white">
          <FaHeart className="text-pink-500 text-6xl mb-6 mx-auto animate-bounce" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Love Gate</h2>
          <p className="text-gray-500 mb-8">Ngày kỷ niệm của chúng mình?</p>
          <input type="password" placeholder="DDMMYYYY" className="w-full text-center text-2xl tracking-[0.5em] p-4 bg-pink-50 rounded-2xl border-2 border-transparent focus:border-pink-300 focus:outline-none transition-all mb-4"
            value={passcode} onChange={(e) => { setPasscode(e.target.value); setError(""); }} onKeyDown={(e) => e.key === 'Enter' && unlock()} />
          <button onClick={unlock} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl hover:bg-pink-600 transition-all shadow-lg hover:shadow-xl">MỞ CỬA</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 bg-transparent min-h-screen selection:bg-pink-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        {[...Array(30)].map((_, i) => (
          <ParallaxHeart key={i} top={`${Math.random() * 100}%`} left={`${Math.random() * 100}%`} size={15 + Math.random() * 60} speed={Math.random() * 2 - 1} color={i % 2 === 0 ? "text-pink-200" : "text-red-100"} />
        ))}
      </div>

      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 right-6 z-50">
        <button onClick={() => setPlaying(!playing)} className={`p-4 rounded-full shadow-lg backdrop-blur-md transition-all ${playing ? 'bg-pink-500 text-white animate-spin-slow' : 'bg-white/80 text-gray-400'}`}>
          <TbVinyl size={24} />
        </button>
      </motion.div>

      <HeroSection days={days} names={{ male: config.male_name, female: config.female_name }} quote={quote} startDate={config.start_date} />
      <HorizontalTimeline timeline={timeline} />
      <DreamCanvas dreams={dreams} />
      <MailboxSection mail={mail} />

      <footer className="py-20 text-center text-gray-400 text-sm bg-white relative z-20">
        <p>Built with ❤️ forever</p>
      </footer>
    </div>
  );
}

export default App;
