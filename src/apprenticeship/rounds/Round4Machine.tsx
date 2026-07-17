import { useState } from "react";
import { Stage } from "../components/Stage";
import { R4 } from "../numbers";
import { cn } from "@/lib/utils";

interface Props {
  onSimulate: () => void;
  running: boolean;
}

type Step = 0 | 1 | 2;

export function Round4Machine({ onSimulate, running }: Props) {
  const [step, setStep] = useState<Step>(0);

  const advance = () => {
    if (step === 0) setStep(1);
    else if (step === 1) {
      setStep(2);
      onSimulate();
    }
  };

  const showPost = step >= 1;
  const showNorm = step === 2;

  return (
    <Stage
      resultTray={
        showPost ? (
          <div className="grid grid-cols-4 gap-3 text-center font-mono">
            <Cell label="Sản lượng" value={`${R4.pre.output} → ${R4.post.output}`} tone="gold" />
<<<<<<< HEAD
            <Cell
              label="Giờ/đv"
              value={`${R4.pre.hoursPerUnit} → ${R4.post.hoursPerUnit.toFixed(2)}`}
              tone="info"
            />
            <Cell label="Giá trị mới" value={`$${R4.post.newValue}`} tone="muted" />
            <Cell
              label="Tất yếu"
              value={
                showNorm
                  ? `${R4.necessaryLabor.before}h → ${R4.necessaryLabor.after}h`
                  : `${R4.necessaryLabor.before}h`
              }
=======
            <Cell label="Giờ/đv" value={`${R4.pre.hoursPerUnit} → ${R4.post.hoursPerUnit.toFixed(2)}`} tone="info" />
            <Cell label="Giá trị mới" value={`$${R4.post.newValue}`} tone="muted" />
            <Cell
              label="Tất yếu"
              value={showNorm ? `${R4.socialNorm.before}h → ${R4.socialNorm.after}h` : `${R4.socialNorm.before}h`}
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
              tone={showNorm ? "danger" : "muted"}
            />
          </div>
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Áp dụng máy để so sánh trước/sau.
          </p>
        )
      }
    >
      <div className="flex w-full flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Side title="Xưởng của bạn" active>
            <Stat label="Lao động sống" value={`${R4.pre.livingHours}h`} />
<<<<<<< HEAD
            <Stat
              label="Sản lượng"
              value={showPost ? `${R4.post.output} đv` : `${R4.pre.output} đv`}
              highlight={showPost}
            />
            <Stat
              label="Giờ/đv"
              value={showPost ? `${R4.post.hoursPerUnit.toFixed(2)}h` : `${R4.pre.hoursPerUnit}h`}
              highlight={showPost}
            />
            <Stat
              label="Giá trị mới do lao động sống"
              value={`$${R4.pre.newValue}`}
              note="Không đổi vì lao động sống không đổi."
            />
          </Side>
          <Side title="Chuẩn ngành" muted>
            <Stat
              label="Thời gian xã hội / đv"
              value={
                showNorm
                  ? `${R4.socialLaborTime.before}h → ${R4.socialLaborTime.after.toFixed(2)}h`
                  : `${R4.socialLaborTime.before}h`
              }
              highlight={showNorm}
            />
            <Stat
              label="Lao động tất yếu"
              value={
                showNorm
                  ? `${R4.necessaryLabor.before}h → ${R4.necessaryLabor.after}h`
                  : `${R4.necessaryLabor.before}h`
              }
              highlight={showNorm}
              note={showNorm ? "Vải rẻ hơn trong rổ sinh hoạt minh họa." : undefined}
            />
            <Stat
              label="Lao động thặng dư"
              value={
                showNorm
                  ? `${R4.surplusLabor.before}h → ${R4.surplusLabor.after}h`
                  : `${R4.surplusLabor.before}h`
              }
              highlight={showNorm}
            />
            <Stat
              label="Trạng thái"
              value={showNorm ? "Đối thủ đã bắt kịp" : "Bạn dẫn trước"}
              note={
                showNorm ? "Lợi nhuận siêu ngạch biến mất." : "Bạn tạm hưởng lợi nhuận siêu ngạch."
              }
=======
            <Stat label="Sản lượng" value={showPost ? `${R4.post.output} đv` : `${R4.pre.output} đv`} highlight={showPost} />
            <Stat label="Giờ/đv" value={showPost ? `${R4.post.hoursPerUnit.toFixed(2)}h` : `${R4.pre.hoursPerUnit}h`} highlight={showPost} />
            <Stat label="Giá trị mới do lao động sống" value={`$${R4.pre.newValue}`} note="Không đổi vì lao động sống không đổi." />
          </Side>
          <Side title="Chuẩn ngành" muted>
            <Stat label="Thời gian xã hội / đv" value={showNorm ? `${R4.post.hoursPerUnit.toFixed(2)}h` : "1h"} highlight={showNorm} />
            <Stat label="Lao động tất yếu" value={showNorm ? `${R4.socialNorm.after}h` : `${R4.socialNorm.before}h`} highlight={showNorm} />
            <Stat
              label="Trạng thái"
              value={showNorm ? "Đối thủ đã bắt kịp" : "Bạn dẫn trước"}
              note={showNorm ? "Lợi nhuận siêu ngạch biến mất." : "Bạn tạm hưởng lợi nhuận siêu ngạch."}
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
            />
          </Side>
        </div>
        {!running && step < 2 && (
          <button
            type="button"
            onClick={advance}
            className="self-center cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
          >
            {step === 0 ? "Áp dụng máy mới" : "Đối thủ cũng áp dụng máy"}
          </button>
        )}
      </div>
    </Stage>
  );
}

<<<<<<< HEAD
function Side({
  title,
  active,
  muted,
  children,
}: {
  title: string;
  active?: boolean;
  muted?: boolean;
  children: React.ReactNode;
}) {
=======
function Side({ title, active, muted, children }: { title: string; active?: boolean; muted?: boolean; children: React.ReactNode }) {
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
  return (
    <div
      className={cn(
        "rounded-md border p-4",
        active && "border-primary/50 bg-primary/5",
        muted && "border-border/60 bg-panel/40",
      )}
    >
      <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

<<<<<<< HEAD
function Stat({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
}) {
=======
function Stat({ label, value, note, highlight }: { label: string; value: string; note?: string; highlight?: boolean }) {
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
<<<<<<< HEAD
        <span className={cn("font-mono text-sm", highlight ? "text-gold" : "text-foreground")}>
          {value}
        </span>
=======
        <span className={cn("font-mono text-sm", highlight ? "text-gold" : "text-foreground")}>{value}</span>
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
      </div>
      {note && <div className="mt-0.5 text-[10px] text-muted-foreground/70">{note}</div>}
    </div>
  );
}

<<<<<<< HEAD
function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "info" | "gold" | "danger";
}) {
  const cls = {
    muted: "text-muted-foreground",
    info: "text-info",
    gold: "text-gold",
    danger: "text-danger",
  }[tone];
=======
function Cell({ label, value, tone }: { label: string; value: string; tone: "muted" | "info" | "gold" | "danger" }) {
  const cls = { muted: "text-muted-foreground", info: "text-info", gold: "text-gold", danger: "text-danger" }[tone];
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
  return (
    <div className="rounded border border-border/40 bg-panel/50 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</div>
      <div className={`mt-1 text-sm ${cls}`}>{value}</div>
    </div>
  );
}
