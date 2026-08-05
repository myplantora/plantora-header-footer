import { useEffect, useRef, useState } from "react";
import { announcements } from "@/config/navigation";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % announcements.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="flex h-[38px] items-center justify-center overflow-hidden bg-primary px-4 text-primary-foreground"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <p
        key={index}
        aria-live="polite"
        className="animate-fade-in truncate text-center text-[13px] font-medium tracking-[0.01em]"
      >
        {announcements[index]}
      </p>
    </div>
  );
}
