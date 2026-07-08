import { Gear, Smoke, Embers } from "./particles";

export function FactoryScene() {
  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-lg rivet-border bg-gradient-to-b from-[oklch(0.22_0.008_50)] via-[oklch(0.18_0.01_40)] to-[oklch(0.12_0.008_35)]">
      {/* Sky glow */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[oklch(0.3_0.05_50/0.6)] to-transparent" />

      {/* Distant chimneys silhouette */}
      <svg viewBox="0 0 400 200" className="absolute inset-x-0 top-4 h-32 w-full opacity-40">
        <path d="M0 200 L0 130 L40 130 L40 80 L60 80 L60 130 L120 130 L120 100 L150 100 L150 130 L220 130 L220 90 L245 90 L245 130 L320 130 L320 110 L360 110 L360 130 L400 130 L400 200 Z" fill="oklch(0.1 0.005 40)" />
      </svg>

      {/* Rising smoke from chimneys */}
      <div className="absolute inset-x-0 top-0 h-1/2">
        <Smoke />
      </div>

      {/* Main factory floor */}
      <div className="absolute inset-x-0 bottom-0 h-2/3">
        {/* Floor */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-[oklch(0.2_0.01_40)] to-[oklch(0.14_0.008_35)]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, oklch(0.28 0.01 40) 0 2px, transparent 2px 40px)",
            }}
          />
        </div>

        {/* Machines */}
        <div className="absolute inset-x-6 bottom-1/3 flex items-end justify-around">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative">
              <div className="h-20 w-16 rounded-t-md bg-gradient-to-b from-[oklch(0.35_0.02_50)] to-[oklch(0.22_0.015_40)] shadow-[inset_0_2px_0_oklch(0.5_0.03_60/0.4)]">
                <div className="mt-2 flex justify-center">
                  <div className="text-primary">
                    <Gear size={28} reverse={i % 2 === 0} />
                  </div>
                </div>
                <div className="mt-1 h-1 mx-2 rounded bg-[oklch(0.7_0.15_45)] animate-flicker" />
              </div>
              {/* Worker */}
              <div className="absolute -right-3 bottom-0 h-8 w-3 rounded-t-full bg-[oklch(0.3_0.02_50)]">
                <div className="mx-auto -mt-2 h-2 w-2 rounded-full bg-[oklch(0.55_0.05_50)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Large background gear */}
        <div className="absolute -left-8 top-4 text-primary/20">
          <Gear size={160} slow />
        </div>
        <div className="absolute -right-10 bottom-8 text-primary/15">
          <Gear size={200} reverse />
        </div>

        {/* Embers */}
        <Embers count={24} />
      </div>
    </div>
  );
}