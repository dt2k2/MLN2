import { Monitor } from "lucide-react";
import { Gear } from "./particles";

export function MobileWarning() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6 text-center lg:hidden">
      <div className="text-primary mb-6">
        <Gear size={80} slow />
      </div>
      <Monitor className="mb-4 h-10 w-10 text-primary" />
      <h1 className="font-display text-2xl text-gold">DAS KAPITALIST</h1>
      <p className="mt-4 max-w-xs text-sm text-muted-foreground">
        Trò chơi được tối ưu cho màn hình lớn. Vui lòng mở trên máy tính (tối thiểu 1280px chiều
        rộng) để trải nghiệm đầy đủ.
      </p>
      <div className="mt-6 rounded-md border border-border bg-panel px-4 py-2 font-mono text-xs text-muted-foreground">
        Desktop Recommended
      </div>
    </div>
  );
}
