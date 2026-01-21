import { useState, useEffect, useMemo, useRef } from 'react';
import { FaHeart, FaPen, FaArrowDown, FaEnvelope, FaCheck } from 'react-icons/fa';
import { TbVinyl } from "react-icons/tb";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

const API_BASE = import.meta.env.PROD ? 'https://inkverse.online/api/love' : 'http://localhost:4000/love';

// --- SUB COMPONENTS ---

const ParallaxHeart = ({ speed = 1, top, left, size, color = "text-pink-200" }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 2000], [0, speed * 200]);
  return (
    <motion.div style={{ y, top, left, fontSize: size }} className={`absolute pointer-events-none z-0 opacity-50 ${color}`}>
      <FaHeart />
    </motion.div>
  );
};

const TimelineItem = ({ event, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      className="relative pl-8 md:pl-12 mb-20"
    >
      <div className="absolute -left-[9px] top-0 z-10">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-6 h-6 bg-pink-500 rounded-full border-4 border-[#fff0f3] shadow-md"
        />
      </div>
      <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-default border border-white/50 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 text-9xl font-black text-pink-50/50 opacity-50 z-0 rotate-12 group-hover:rotate-0 transition-transform duration-500 select-none">
          {index + 1}
        </div>
        <div className="relative z-10">
          <span className="inline-block bg-pink-100/80 text-pink-600 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-sm backdrop-blur-md">
            {event.date}
          </span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
          <p className="text-gray-600 leading-relaxed mb-4">{event.description}</p>
          {event.image_url && (
            <div className="rounded-2xl overflow-hidden shadow-inner">
              <motion.img initial={{ scale: 1.1 }} whileInView={{ scale: 1 }} transition={{ duration: 1.5 }} src={event.image_url} alt={event.title} className="w-full h-auto object-cover" />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Extracted to isolate useScroll hook dependent on ref
const TimelineSection = ({ timeline }) => {
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <section ref={timelineRef} className="min-h-screen py-20 px-6 relative">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ margin: "-200px" }} className="mb-20 text-center">
        <span className="text-pink-500 text-sm font-bold tracking-widest uppercase mb-2 block">Chương 1</span>
        <h2 className="text-4xl font-bold text-gray-800">Chuyện Tình Yêu</h2>
      </motion.div>

      <div className="relative ml-4 md:ml-10">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-pink-100 rounded-full"></div>
        <motion.div className="absolute left-0 top-0 w-[2px] bg-gradient-to-b from-pink-500 to-red-500 rounded-full origin-top" style={{ height: "100%", scaleY }}></motion.div>

        <div className="space-y-4 pb-20 pt-4">
          {timeline.map((event, idx) => (
            <TimelineItem key={idx} event={event} index={idx} />
          ))}
          {timeline.length === 0 && <p className="pl-12 text-gray-400 italic">Chưa có kỷ niệm nào được lưu...</p>}
        </div>
      </div>
    </section>
  );
};

const ScrollyBackground = ({ children }) => {
  const { scrollY } = useScroll();
  const bgColor = useTransform(
    scrollY,
    [0, 800, 1600, 2400],
    ["#fff0f3", "#fff0f3", "#f0fff4", "#f3f0ff"]
  );
  return (
    <motion.div style={{ backgroundColor: bgColor }} className="min-h-screen text-gray-800 font-sans selection:bg-pink-200 relative transition-colors duration-1000">
      {children}
    </motion.div>
  )
}

// --- MAIN APP ---

function App() {
  const [config, setConfig] = useState(null);
  const [days, setDays] = useState(0);
  const [locked, setLocked] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  // Data
  const [quote, setQuote] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [dreams, setDreams] = useState([]);
  const [mail, setMail] = useState([]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = () => {
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(data => {
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
      setLocked(false);
      fetchData();
    } else {
      setError("Sai mật khẩu rồi người yêu ơi!");
    }
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
      <div className="h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-10 left-10 text-pink-200 text-6xl opacity-50"><FaHeart /></motion.div>
        <motion.div animate={{ y: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 7 }} className="absolute bottom-20 right-10 text-red-200 text-8xl opacity-50"><FaHeart /></motion.div>

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-white/50 z-10">
          <div className="text-pink-500 text-5xl mb-6 mx-auto w-fit animate-bounce"><FaHeart /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Love Gate</h2>
          <p className="text-gray-500 mb-8 text-sm">Nhập ngày kỷ niệm của chúng mình</p>
          <input
            type="password" placeholder="DDMMYYYY" className="w-full text-center text-2xl tracking-[0.5em] p-4 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:outline-none focus:border-pink-400 focus:bg-white transition-all mb-6 text-gray-700 placeholder-pink-200"
            value={passcode} onChange={(e) => { setPasscode(e.target.value); setError(""); }} onKeyDown={(e) => e.key === 'Enter' && unlock()}
          />
          <AnimatePresence>
            {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 mb-6 font-bold text-sm">{error}</motion.p>}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={unlock} className="w-full bg-gradient-to-r from-pink-500 to-red-400 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">MỞ CỬA TRÁI TIM</motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <ScrollyBackground>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <ParallaxHeart top="10%" left="5%" size={40} speed={-1} />
        <ParallaxHeart top="20%" left="80%" size={60} speed={2} color="text-red-100" />
        <ParallaxHeart top="50%" left="10%" size={30} speed={0.5} />
        <ParallaxHeart top="70%" left="85%" size={50} speed={1.5} color="text-pink-100" />
        <ParallaxHeart top="40%" left="40%" size={100} speed={-0.5} color="text-white opacity-20" />
      </div>

      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 right-6 z-50 flex gap-4">
        <button onClick={() => setPlaying(!playing)} className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${playing ? 'bg-pink-500 text-white animate-spin-slow' : 'bg-white/80 text-gray-400'}`}>
          <TbVinyl size={24} />
        </button>
      </motion.div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "backOut" }} className="text-center z-10">
            <h1 className="text-3xl font-light text-gray-600 mb-8 flex items-center justify-center gap-3">
              {config.male_name} <FaHeart className="text-red-500 text-xl animate-pulse" /> {config.female_name}
            </h1>
            <div className="relative mb-12">
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 1 }} className="text-[12rem] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-red-500 drop-shadow-sm select-none">
                {days}
              </motion.div>
              <p className="text-xl font-medium text-gray-400 tracking-[0.2em] uppercase mt-2">Days in Love</p>
            </div>
            {quote && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} delay={0.6} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 max-w-md mx-auto shadow-sm">
                <p className="text-lg italic text-gray-600 font-serif">"{quote.quote}"</p>
                <p className="text-xs font-bold text-pink-400 mt-3">— {quote.author}</p>
              </motion.div>
            )}
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 text-pink-300">
            <div className="flex flex-col items-center gap-2"><span className="text-xs uppercase tracking-widest">Bắt đầu câu chuyện</span><FaArrowDown /></div>
          </motion.div>
        </section>

        {/* TIMELINE SECTION */}
        <TimelineSection timeline={timeline} />

        {/* DREAM LIST */}
        <section className="min-h-[80vh] py-20 px-6 my-10 mx-4 relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12 text-center">
            <span className="text-green-500 text-sm font-bold tracking-widest uppercase mb-2 block">Chương 2</span>
            <h2 className="text-4xl font-bold text-gray-800">Điều Muốn Làm Cùng Nhau</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-4">
            {dreams.map((dream, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: idx * 0.1 }} className={`flex items-center gap-4 p-5 rounded-2xl transition-all cursor-pointer bg-white/60 backdrop-blur-md shadow-sm hover:bg-white border border-white/50`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${dream.is_completed === 'TRUE' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                  {dream.is_completed === 'TRUE' ? <FaCheck size={14} /> : <div className="w-3 h-3 bg-gray-300 rounded-full"></div>}
                </div>
                <span className={`text-lg font-medium transition-colors ${dream.is_completed === 'TRUE' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{dream.task}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* MAILBOX */}
        <section className="min-h-screen py-20 px-6 pb-40">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12 text-center">
            <span className="text-purple-500 text-sm font-bold tracking-widest uppercase mb-2 block">Chương 3</span>
            <h2 className="text-4xl font-bold text-gray-800">Hộp Thư Bí Mật</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-400 to-pink-400 p-6 rounded-3xl text-white shadow-lg flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 text-2xl"><FaPen /></motion.div>
              <h3 className="font-bold text-xl">Gửi thư mới</h3>
            </motion.div>
            {mail.map((m, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/50 relative group overflow-hidden transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12"><FaEnvelope size={80} /></div>
                <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-purple-500 transition-colors">{m.title}</h4>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">{m.content}</p>
                <div className="flex justify-between items-center text-xs font-medium uppercase tracking-wide">
                  <span className="text-gray-400">{new Date(m.timestamp).toLocaleDateString()}</span>
                  <span className="text-pink-500">From {m.sender}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="text-center pb-12 text-gray-400 text-sm">
          <p>Built with ❤️ for {config.female_name} by {config.male_name}</p>
        </footer>
      </div>
    </ScrollyBackground>
  );
}

export default App;
