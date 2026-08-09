import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Temporary debug component to highlight effective padding on the page.
 * Renders an overlay that highlights left/right padding of all sections.
 */
export const PaddingAuditOverlay = () => {
  const [enabled, setEnabled] = useState(false);
  const [sections, setSections] = useState<{ id: string; rect: DOMRect; paddingLeft: string; paddingRight: string }[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const audit = () => {
      const elements = Array.from(document.querySelectorAll("section, main > div, .px-2\\.5"));
      const data = elements.map((el, i) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          id: `audit-${i}`,
          rect,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
        };
      });
      setSections(data);
    };

    audit();
    window.addEventListener("resize", audit);
    window.addEventListener("scroll", audit);
    
    return () => {
      window.removeEventListener("resize", audit);
      window.removeEventListener("scroll", audit);
    };
  }, [enabled]);

  if (typeof document === "undefined") return null;

  return (
    <>
      <button
        onClick={() => setEnabled(!enabled)}
        className="fixed bottom-4 left-4 z-[9999] rounded-full bg-black/80 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {enabled ? "HIDE PADDING AUDIT" : "SHOW PADDING AUDIT"}
      </button>

      {enabled && createPortal(
        <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden">
          {sections.map((s) => {
            const pl = parseFloat(s.paddingLeft);
            const pr = parseFloat(s.paddingRight);
            
            return (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  top: s.rect.top,
                  left: s.rect.left,
                  width: s.rect.width,
                  height: s.rect.height,
                  border: "1px dashed rgba(255, 0, 0, 0.2)",
                }}
              >
                {/* Left Padding Indicator */}
                {pl > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: pl,
                      backgroundColor: pl === 10 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)",
                    }}
                  >
                    <span className="absolute left-0 top-0 bg-black text-[8px] text-white">
                      {pl}px
                    </span>
                  </div>
                )}
                
                {/* Right Padding Indicator */}
                {pr > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: pr,
                      backgroundColor: pr === 10 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)",
                    }}
                  >
                    <span className="absolute right-0 top-0 bg-black text-[8px] text-white">
                      {pr}px
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};
