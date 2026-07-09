import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";

export function EndTurnButton({ onEnd }: { onEnd: () => void }) {
  const [loading, setLoading] = useState(false);
  const click = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      onEnd();
      setLoading(false);
    }, 1500);
  };
  return (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      onClick={click}
      disabled={loading}
      className="relative w-full overflow-hidden rounded-lg border-2 border-primary bg-gradient-to-b from-[oklch(0.8_0.14_78)] to-[oklch(0.62_0.14_70)] px-6 py-4 font-display text-base font-bold uppercase tracking-[0.3em] text-[oklch(0.15_0.01_60)] shadow-[0_10px_30px_oklch(0.4_0.1_60/0.4),inset_0_2px_0_oklch(0.95_0.05_80/0.6)] disabled:opacity-90"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Đang kết thúc quý...
          </>
        ) : (
          <>
            Kết thúc quý <ChevronRight className="h-5 w-5" />
          </>
        )}
      </span>
      <span
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.2 0.01 60 / 0.3) 6px 8px)",
        }}
      />
    </motion.button>
  );
}
