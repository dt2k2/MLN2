import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Factory, GraduationCap, Play, SkipForward, Volume2, VolumeX } from "lucide-react";
import city from "@/assets/intro-1-city.jpg";
import heinrich from "@/assets/intro-2-heinrich.jpg";
import desk from "@/assets/intro-3-desk.jpg";
import workers from "@/assets/intro-4-workers.jpg";
import { BAL } from "@/game/balance";

export const Route = createFileRoute("/intro")({
  head: () => ({
    meta: [
      { title: "Prolog — Das Kapitalist" },
      {
        name: "description",
        content: "Rhineland, 1852. Heinrich Müller thừa kế xưởng dệt của cha mình.",
      },
    ],
  }),
  component: IntroScene,
});

interface Beat {
  img: string;
  start: number; // seconds
  end: number;
  text: string;
  caption: string;
}

const BEATS: Beat[] = [
  {
    img: city,
    start: 0,
    end: 21,
    caption: "Rhineland, Vương quốc Phổ · Mùa xuân 1852",
    text: "Mùa xuân năm 1852. Bốn năm đã trôi qua kể từ khi những chiến lũy cách mạng 1848 sụp đổ trên khắp châu Âu. Ở vùng Rhineland của nước Phổ, khói than một lần nữa che kín bầu trời — nhưng lần này, không phải khói của súng đại bác, mà của những ống khói nhà máy.",
  },
  {
    img: heinrich,
    start: 21,
    end: 43,
    caption: "Heinrich Müller · 32 tuổi · Müller & Söhne Textilwerk",
    text: `Bạn là Heinrich Müller, ba mươi hai tuổi, vừa thừa kế xưởng dệt bên sông Wupper: ${BAL.initialMachines} cỗ máy dệt hơi nước, ${BAL.initialActiveWorkers} công nhân có ca, ${BAL.initialIdleWorkers} người chờ việc và khoản nợ ngân hàng $${BAL.initialDebt.toLocaleString("vi-VN")} vẫn sinh lãi. Cha bạn từng dạy: “Con ơi — tư bản không nghỉ ngơi.”`,
  },
  {
    img: desk,
    start: 43,
    end: 65,
    caption: "24 quý · 6 năm · Sổ cái đang mở",
    text: "Trước mặt bạn là hai mươi bốn quý — sáu năm — để biến xưởng này thành một đế chế, hay chứng kiến nó sụp đổ. Bauer ở phía nam vẫn dựa vào lao động rẻ. Krupp ở phía bắc đang mua máy mới mỗi tháng. Giá trị xã hội của mỗi thước vải đang giảm từng ngày, và bạn phải chạy — chỉ để đứng yên.",
  },
  {
    img: workers,
    start: 65,
    end: 91,
    caption: "Cổng xưởng · Bình minh",
    text: "Mỗi quyết định của bạn — kéo dài ngày lao động, hạ tiền lương, vay thêm tín dụng, hay tái đầu tư vào máy móc — sẽ vẽ nên số phận của bạn và của những con người đứng sau cánh cổng kia. Câu hỏi không phải là bạn sẽ thắng hay thua. Mà là: khi mọi chuyện kết thúc, bạn đã trở thành ai?",
  },
];

const TOTAL = BEATS[BEATS.length - 1].end;

function IntroScene() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [started, setStarted] = useState(false);

  const finish = (destination: "/game" | "/apprenticeship") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dk_intro_seen", "1");
    }
    navigate({ to: destination });
  };

  // Preload all images
  useEffect(() => {
    BEATS.forEach((b) => {
      const img = new Image();
      img.src = b.img;
    });
  }, []);

  // Timer loop
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now() - elapsed * 1000;
    let raf = 0;
    const tick = () => {
      const now = (performance.now() - t0) / 1000;
      if (now >= TOTAL) {
        setElapsed(TOTAL);
        return;
      }
      setElapsed(now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Try play audio when starting
  useEffect(() => {
    if (!started) return;
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {
      // Autoplay blocked or file missing — continue silently
    });
  }, [started]);

  const current = BEATS.find((b) => elapsed >= b.start && elapsed < b.end) ?? BEATS[BEATS.length - 1];
  const progress = Math.min(100, (elapsed / TOTAL) * 100);
  const isLastBeat = current === BEATS[BEATS.length - 1];
  const beatProgress = Math.min(1, (elapsed - current.start) / (current.end - current.start));

  return (
    <main className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black text-white">
      {/* Hidden audio; graceful if missing */}
      <audio
        ref={audioRef}
        src="/audio/intro-narration.mp3"
        preload="auto"
        muted={muted}
        onError={() => setAudioAvailable(false)}
      />

      {/* Scene background — Ken Burns */}
      <AnimatePresence>
        <motion.div
          key={current.img}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1.15 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.2 },
            scale: { duration: current.end - current.start, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <img
            src={current.img}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Vignette + bottom gradient for text */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Top bar: progress + controls */}
      <div className="relative z-10 flex items-center justify-between gap-4 px-6 pt-5">
        <div className="flex-1">
          <div className="h-[2px] w-full overflow-hidden rounded bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[oklch(0.6_0.13_60)] to-[oklch(0.75_0.15_75)] transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
            Prolog · {Math.floor(elapsed)}s / {TOTAL}s
          </div>
        </div>
        <div className="flex items-center gap-2">
          {audioAvailable ? (
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs backdrop-blur hover:border-white/60 hover:bg-white/10"
              title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => finish("/game")}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 font-mono text-xs uppercase tracking-widest backdrop-blur hover:border-white/60 hover:bg-white/10"
          >
            Bỏ qua <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Caption chip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`cap-${current.img}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute left-1/2 top-20 z-10 -translate-x-1/2"
        >
          <div className="rounded-full border border-white/15 bg-black/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.35em] text-white/70 backdrop-blur">
            {current.caption}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Narration text */}
      <div className="relative z-10 mt-auto flex flex-col items-center px-8 pb-16">
        <AnimatePresence mode="wait">
          <motion.p
            key={`text-${current.img}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9 }}
            className="max-w-3xl text-center font-serif text-xl leading-[1.7] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] md:text-2xl"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            {current.text}
          </motion.p>
        </AnimatePresence>

        {/* Start button (initial) */}
        {!started ? (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            type="button"
            onClick={() => setStarted(true)}
            className="mt-10 flex cursor-pointer items-center gap-3 rounded-md border border-[oklch(0.6_0.13_60)] bg-[oklch(0.35_0.08_60)]/40 px-8 py-3 font-display text-sm uppercase tracking-[0.4em] text-[oklch(0.85_0.13_75)] backdrop-blur transition hover:bg-[oklch(0.4_0.1_60)]/60 hover:shadow-[0_0_40px_oklch(0.55_0.13_60/0.5)]"
          >
            <Play className="h-4 w-4" /> Bắt đầu prolog
          </motion.button>
        ) : null}

        {/* Continue button on final beat */}
        {started && isLastBeat && beatProgress > 0.5 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-8 flex w-full max-w-2xl flex-col items-stretch justify-center gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={() => finish("/apprenticeship")}
              className="group flex min-h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-md border border-[oklch(0.68_0.14_72)] bg-[oklch(0.38_0.09_62)]/80 px-6 py-3 font-display text-sm uppercase tracking-[0.22em] text-[oklch(0.9_0.12_78)] shadow-[0_0_30px_oklch(0.55_0.13_60/0.28)] backdrop-blur transition hover:bg-[oklch(0.43_0.1_62)]/90 hover:shadow-[0_0_40px_oklch(0.55_0.13_60/0.45)]"
            >
              <GraduationCap className="h-5 w-5 shrink-0" />
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span>Vào ca học việc</span>
                <span className="font-mono text-[8px] tracking-[0.14em] text-white/55">
                  Khuyên dùng lần đầu
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => finish("/game")}
              className="flex min-h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-md border border-white/25 bg-black/45 px-6 py-3 font-display text-sm uppercase tracking-[0.22em] text-white/80 backdrop-blur transition hover:border-white/55 hover:bg-white/10 hover:text-white"
            >
              <Factory className="h-5 w-5 shrink-0" /> Vào xưởng ngay
            </button>
          </motion.div>
        ) : null}
      </div>

      {/* Missing audio hint */}
      {started && !audioAvailable ? (
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-white/30">
          Chưa có file narration · thả vào /public/audio/intro-narration.mp3
        </div>
      ) : null}
    </main>
  );
}
