import { useState, useEffect, useRef, useMemo } from 'react';
import { FaHeart, FaPen, FaArrowDown, FaEnvelope, FaCheck, FaPlus, FaTimes, FaChevronDown } from 'react-icons/fa';
import { TbVinyl } from "react-icons/tb";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

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

const WavyString = ({ count }) => {
  if (count < 2) return null;
  const startX = 770;
  const stride = 580;
  const points = [];
  for (let i = 0; i < count; i++) points.push(startX + i * stride);
  let path = `M ${points[0]} 300`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    path += ` C ${current + 100} 450, ${next - 100} 450, ${next} 300`;
  }
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0" style={{ minWidth: `${startX + count * stride}px` }}>
      <path d={path} fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="10, 5" strokeLinecap="round" className="opacity-60" />
      {points.map((x, i) => (<circle key={i} cx={x} cy="300" r="6" fill="#f472b6" />))}
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
          <WavyString count={timeline.length} />
          <div className="min-w-[400px] flex-shrink-0 pl-10 relative z-10">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <span className="text-pink-500 text-sm font-bold tracking-widest uppercase mb-4 block">Chương 1</span>
              <h2 className="text-6xl font-bold text-gray-800 leading-tight">Hành Trình<br />Của Chúng Mình</h2>
              <p className="mt-6 text-gray-500 text-lg max-w-xs">Kéo xuống để xem lại những thước phim kỷ niệm...</p>
              <div className="mt-8 text-4xl text-pink-300 animate-bounce-x">→</div>
            </motion.div>
          </div>
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-4 h-4 rounded-full bg-pink-400 shadow-md z-20"></div>
              <div className="absolute top-4 right-6 text-9xl font-black text-gray-100 z-0 select-none opacity-50">{idx + 1}</div>
              <div className="h-3/5 overflow-hidden relative">
                <motion.img src={event.image_url || "https://source.unsplash.com/random/800x600/?love"} className="w-full h-full object-cover" whileHover={{ scale: 1.1 }} transition={{ duration: 0.7 }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1 p-8 relative z-10 bg-white flex flex-col justify-center">
                <span className="inline-block self-start bg-pink-50 text-pink-600 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-pink-100">{event.date}</span>
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


// 3. WISHING TREE - SCROLLYTELLING EDITION (300vh)
// Vertical Journey: Canopy (0-30%) -> Trunk (30-70%) -> Roots (70-100%)
const ANCHORS = [
  // TRUNK AREA (30% - 70% of 300vh, so 90vh - 210vh)
  // y-coordinates are percentages of the 300vh section height
  { x: "15%", y: "32%", len: 200 }, // High Left
  { x: "35%", y: "35%", len: 180 },
  { x: "60%", y: "33%", len: 220 }, // High Right
  { x: "80%", y: "38%", len: 190 },

  { x: "25%", y: "45%", len: 250 }, // Mid Left
  { x: "50%", y: "42%", len: 280 }, // Center Core
  { x: "70%", y: "48%", len: 210 },

  { x: "10%", y: "55%", len: 170 }, // Low Left
  { x: "40%", y: "58%", len: 200 },
  { x: "85%", y: "56%", len: 180 }, // Low Right
];

const WishingTreeSection = ({ dreams, onAddDream }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDream, setNewDream] = useState("");
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newDream.trim()) {
      await onAddDream(newDream);
      setNewDream("");
      setIsModalOpen(false);
    }
  };

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-[#1a0b2e] overflow-hidden">

      {/* FIXED BACKGROUND LAYER - PARALLAX TREE */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
          style={{ opacity: 1 }} // Always visible
        >
          {/* The Huge Tree Image scrolling 'through' the viewport */}
          <motion.img
            src="/golden-tree-isolated.png"
            alt="Golden Wishing Tree"
            className="absolute w-full h-[300vh] max-w-none object-cover object-top mix-blend-screen"
            style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]) }}
          />

          {/* Magical Atmosphere Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e]/30 via-transparent to-[#1a0b2e] pointer-events-none"></div>
          <motion.div
            className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay"
            style={{ opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.3, 0]) }}
          ></motion.div>
        </motion.div>
      </div>

      {/* SCROLLABLE CONTENT LAYER */}
      <div className="relative z-10 w-full h-full pointer-events-none">

        {/* --- PART 1: THE CANOPY (0-100vh) --- */}
        <div className="h-screen w-full flex flex-col items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <span className="text-yellow-300 text-lg font-bold tracking-[0.5em] uppercase mb-4 block drop-shadow-md">Chương 2</span>
            <h2 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)] font-serif">
              Cây Nguyện Ước
            </h2>
            <p className="mt-6 text-yellow-100/80 text-xl max-w-2xl mx-auto font-light italic">
              "Kéo xuống để treo lên những giấc mơ của chúng mình..."
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-20 text-yellow-500/50"
            >
              <FaChevronDown size={40} />
            </motion.div>
          </motion.div>
        </div>


        {/* --- PART 2: THE TRUNK & WISHES (100-200vh) --- */}
        <div className="h-[150vh] w-full relative max-w-7xl mx-auto">
          {/* Note: This div covers the 'middle' area where tags hang. 
                        We map the 'absolute' ANCHORS relative to this container or similar. 
                        Actually, simplest is to just place them absolutely in the main 300vh container.
                    */}
        </div>


        {/* --- PART 3: THE ROOTS (200-300vh) --- */}
        <div className="h-[50vh] w-full flex items-center justify-center pointer-events-auto pb-20 mt-auto absolute bottom-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-100px" }}
            className="flex flex-col items-center group cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-[2px] h-32 bg-gradient-to-b from-transparent via-yellow-200 to-yellow-500 shadow-[0_0_10px_gold]"></div>
            <div className="w-28 h-28 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.6)] flex items-center justify-center relative border-4 border-yellow-100 group-hover:scale-110 transition-transform duration-300">
              <FaPlus className="text-yellow-900/80 text-4xl animate-pulse" />
              <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/20"></div>
            </div>
            <span className="mt-6 text-sm font-bold text-yellow-300 uppercase tracking-widest bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/30">
              Gieo Mầm Ước Mơ Mới
            </span>
          </motion.div>
        </div>

        {/* FLOATING TAGS - ABSOLUTE TO THE WHOLE SECTION */}
        {/* We map them to the full 300vh height */}
        {dreams.map((dream, idx) => {
          const anchor = ANCHORS[idx % ANCHORS.length];
          const jitterX = Math.floor(idx / ANCHORS.length) * 4 - 8;

          return (
            <div key={idx} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <WishTag
                dream={dream}
                index={idx}
                anchor={{ ...anchor, x: `calc(${anchor.x} + ${jitterX}%)` }}
              />
            </div>
          );
        })}

      </div>

      {/* MODAL (unchanged) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><FaTimes size={24} /></button>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><div className="w-2 h-8 bg-yellow-400 rounded-full"></div>Gửi Ước Mơ Mới</h3>
              <form onSubmit={handleSubmit}>
                <textarea
                  className="w-full h-32 bg-gray-50 rounded-xl p-4 border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none resize-none mb-6 text-lg"
                  placeholder="Chúng mình sẽ cùng nhau..."
                  value={newDream}
                  onChange={(e) => setNewDream(e.target.value)}
                  autoFocus
                ></textarea>
                <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  TREO LÊN CÂY
                </button>
              </form>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// 4. WISH TAG (UPDATED FOR SCROLL REVEAL)
const WishTag = ({ dream, index, anchor }) => {
  const swayDuration = useMemo(() => 3 + Math.random() * 3, []);
  const delay = useMemo(() => Math.random() * 2, []);

  return (
    <motion.div
      className="absolute z-20 pointer-events-auto"
      style={{ left: anchor.x, top: anchor.y }}
      // Scroll Reveal Effect: Fade in and slide up as they come into view
      initial={{ opacity: 0, y: 100, scale: 0.5 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ margin: "-50px", once: false, amount: 0.5 }} // Re-triggers slightly
      transition={{ duration: 0.8, delay: index * 0.1, ease: "backOut" }}
    >
      <motion.div
        animate={{ rotate: [2, -2, 2] }}
        transition={{ duration: swayDuration, repeat: Infinity, ease: "easeInOut", delay: delay }}
        className="origin-top flex flex-col items-center -translate-x-1/2"
      >
        {/* Anchor Point Dot */}
        <div className="w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_gold] mb-[-1px] relative z-20"></div>

        {/* String - Dynamic Length? We keep fixed from anchor for now */}
        <div style={{ height: anchor.len }} className="w-[1px] bg-gradient-to-b from-yellow-200 to-yellow-500/50 shadow-[0_0_2px_gold]"></div>

        {/* Lantern Card - Enhanced Glassmorphism */}
        <div className={`w-40 aspect-[3/4] relative p-5 flex flex-col items-center justify-center text-center shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl rounded-xl transition-all hover:scale-110 hover:shadow-[0_0_30px_gold] border border-white/10 overflow-hidden group hover:z-50`}>

          {/* Status Background */}
          <div className={`absolute inset-0 opacity-60 ${dream.is_completed === 'TRUE' ? 'bg-gradient-to-br from-green-900 to-black' : 'bg-gradient-to-br from-red-900 to-black'}`}></div>

          {/* Holo/Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/80 options-none"></div>

          {/* Hanger Hole */}
          <div className="absolute -top-1.5 w-3 h-3 bg-[#1a0b2e] rounded-full border border-yellow-500 z-20"></div>

          <h4 className="text-yellow-400 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10 border-b border-yellow-500/30 pb-1">Wish #{index + 1}</h4>
          <p className={`text-white font-medium text-sm leading-relaxed line-clamp-4 relative z-10 drop-shadow-lg ${dream.is_completed === 'TRUE' ? 'line-through opacity-50 text-green-200' : ''}`}>
            {dream.task}
          </p>

          {dream.is_completed === 'TRUE' && (
            <div className="absolute bottom-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-green-900 shadow-[0_0_15px_lime] z-20 animate-bounce">
              <FaCheck size={10} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}


// 4. REALISTIC MAILBOX COMPONENT
const RealisticMailbox = ({ letters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLetters, setShowLetters] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      setShowLetters(false);
    } else {
      setIsOpen(true);
      // Delay letter animation slightly to match door opening visual
      setTimeout(() => setShowLetters(true), 100);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Mailbox Images Container */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[400px] h-[500px] md:w-[500px] md:h-[600px] cursor-pointer z-20 group"
        onClick={toggleOpen}
      >
        {/* Closed Image */}
        <motion.img
          src="/mailbox-closed.png"
          alt="Mailbox Closed"
          style={{
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
          }}
          className={`absolute inset-0 w-full h-full object-contain mix-blend-multiply brightness-105 contrast-125 transition-all duration-[1000ms] ease-in-out ${isOpen ? 'opacity-0 scale-110' : 'opacity-100 scale-100'} group-hover:scale-105`}
        />

        {/* Open Image */}
        <motion.img
          src="/mailbox-open.png"
          alt="Mailbox Open"
          style={{
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
          }}
          className={`absolute inset-0 w-full h-full object-contain mix-blend-multiply brightness-105 contrast-125 transition-all duration-[1000ms] ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} group-hover:scale-105`}
        />

        {/* Flying Letters Animation */}
        <AnimatePresence>
          {showLetters && isOpen && (
            <>
              {letters.length > 0 ? (
                letters.map((letter, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: (idx % 2 === 0 ? 1 : -1) * (100 + Math.random() * 50),
                      y: -100 - Math.random() * 50,
                      rotate: Math.random() * 30 - 15
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="absolute top-1/3 left-1/2 w-16 h-16 md:w-24 md:h-24 z-10 hover:z-50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLetter(letter);
                    }}
                  >
                    <img src="/envelope.png" alt="Letter" className="w-full h-full object-contain drop-shadow-md hover:scale-110 transition-transform mix-blend-multiply filter contrast-125" />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: -50 }}
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-lg text-sm text-gray-500 whitespace-nowrap shadow-sm pointer-events-none"
                >
                  Chưa có thư mới...
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Letter Reading Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="bg-[#fffdf5] p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full relative rotate-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-6 opacity-10"><FaHeart className="text-6xl text-red-500" /></div>
              <h3 className="text-2xl font-bold text-red-800 font-serif mb-4 border-b-2 border-red-100 pb-2">{selectedLetter.title}</h3>
              <div className="text-gray-800 font-serif text-lg leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedLetter.content}
              </div>
              <div className="mt-8 text-right text-sm font-bold text-red-400 uppercase tracking-widest flex flex-col">
                <span>From: {selectedLetter.sender}</span>
                <span className="text-xs opacity-70">{new Date(selectedLetter.timestamp).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setSelectedLetter(null)}
                className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                <FaTimes />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 5. SEND LETTER COMPONENT (Dashed Circle)
const SendLetterTrigger = ({ onSend }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', sender: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content || !formData.sender) return;

    setStatus('sending');
    await onSend(formData);
    setStatus('success');

    setTimeout(() => {
      setShowModal(false);
      setStatus('idle');
      setFormData({ title: '', content: '', sender: '' });
    }, 2000); // Close after 2s of success
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 group">
        <motion.button
          className="w-32 h-32 rounded-full border-4 border-dashed border-pink-300 flex items-center justify-center bg-white/50 backdrop-blur-sm group-hover:bg-white group-hover:border-pink-500 transition-all cursor-pointer relative overflow-hidden"
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ type: "spring", stiffness: 200 }}
          onClick={() => setShowModal(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait">
            {isHovered ? (
              <motion.div
                key="pen"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-pink-500"
              >
                <FaPen size={32} />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-pink-300"
              >
                <FaPlus size={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        <span className="text-pink-400 font-bold uppercase tracking-widest text-sm group-hover:text-pink-600 transition-colors">Gửi thư mới</span>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                className="bg-white p-8 rounded-2xl flex flex-col items-center text-center max-w-sm"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500 text-3xl animate-bounce">
                  <FaCheck />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Đã gửi thành công!</h3>
                <p className="text-gray-500 mt-2">Lá thư đang bay đến người ấy...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative"
              >
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><div className="w-1 h-6 bg-pink-500 rounded-full"></div> Viết Thư Tình</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input
                    className="w-full bg-pink-50/50 p-3 rounded-xl border border-pink-100 focus:border-pink-400 outline-none"
                    placeholder="Tiêu đề (Ví dụ: Nhớ em...)"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                  <textarea
                    className="w-full h-40 bg-pink-50/50 p-3 rounded-xl border border-pink-100 focus:border-pink-400 outline-none resize-none"
                    placeholder="Viết những lời yêu thương vào đây..."
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    required
                  ></textarea>
                  <div className="flex gap-4">
                    <input
                      className="flex-1 bg-pink-50/50 p-3 rounded-xl border border-pink-100 focus:border-pink-400 outline-none"
                      placeholder="Người gửi (Ký tên)"
                      value={formData.sender}
                      onChange={e => setFormData({ ...formData, sender: e.target.value })}
                      required
                    />
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? 'Đang gửi...' : 'GỬI ĐI'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// 6. MAILBOX SECTION WRAPPER
const MailboxSection = ({ mail, onSendLetter }) => {
  return (
    <section className="min-h-screen py-20 px-6 relative z-30 overflow-hidden bg-[#fff5f5]">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-red-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <span className="text-red-400 text-sm font-bold tracking-widest uppercase mb-2 block">Chương 3</span>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-pink-600 mb-6 drop-shadow-sm font-serif">
            Hộp Thư Tình Yêu
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
            Nơi lưu giữ những lời yêu thương chân thành nhất. Chạm vào hộp thư để xem, hoặc nhấn nút bên dưới để gửi yêu thương.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 w-full">
          {/* The Mailbox */}
          <RealisticMailbox letters={mail} />

          {/* The Send Trigger */}
          <SendLetterTrigger onSend={onSendLetter} />
        </div>
      </div>
    </section>
  );
};

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

  const handleAddDream = async (task) => {
    try {
      // Implement POST request
      await fetch(`${API_BASE}/dreamlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      // Refresh list
      fetch(`${API_BASE}/dreamlist`).then(r => r.json()).then(setDreams);
    } catch (err) {
      console.error("Failed to add dream", err);
    }
  };

  const handleAddMail = async (letterData) => {
    try {
      await fetch(`${API_BASE}/mailbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letterData)
      });
      fetch(`${API_BASE}/mailbox`).then(r => r.json()).then(setMail);
    } catch (err) {
      console.error("Failed to send letter", err);
    }
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
      <WishingTreeSection dreams={dreams} onAddDream={handleAddDream} />
      {/* Passed handleAddDream as a temporary placeholder if user wants same API, but realistically need new endpoint. 
          Assuming 'mailbox' endpoint handles POST. 
          Let's create handleAddMail similar to handleAddDream.
      */}
      <MailboxSection mail={mail} onSendLetter={handleAddMail} />

      <footer className="py-20 text-center text-gray-400 text-sm bg-white relative z-20">
        <p>Built with ❤️ forever</p>
      </footer>
    </div>
  );
}

export default App;
