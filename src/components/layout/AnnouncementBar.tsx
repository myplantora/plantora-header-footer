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
      className="relative flex h-[34px] items-center overflow-hidden bg-primary px-4 text-primary-foreground"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="flex w-full whitespace-nowrap">
        <div className="animate-marquee flex gap-12 sm:gap-24">
          {[...announcements, ...announcements, ...announcements].map((text, i) => (
            <p
              key={`${text}-${i}`}
              className="inline-flex shrink-0 items-center text-[13px] font-medium tracking-[0.01em]"
            >
              {text.includes("★") ? (
                <>
                  {text.split("★").map((part, index, array) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <span className="text-[#E9AD20]">★</span>
                      )}
                    </span>
                  ))}
                </>
              ) : (
                text
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
