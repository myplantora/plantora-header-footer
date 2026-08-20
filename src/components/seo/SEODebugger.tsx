import React, { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Settings, X, ChevronRight, Info, Search, ShieldCheck, FileCode } from "lucide-react";

export function SEODebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [metadata, setMetadata] = useState<{
    title: string;
    description: string;
    canonical: string;
    og: Record<string, string>;
    twitter: Record<string, string>;
    robots: string;
    structuredData: any[];
  }>({
    title: "",
    description: "",
    canonical: "",
    og: {},
    twitter: {},
    robots: "",
    structuredData: [],
  });

  const state = useRouterState();

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure head tags are updated by TanStack Router
    const timer = setTimeout(() => {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || window.location.href;
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") || "index, follow";

      const og: Record<string, string> = {};
      document.querySelectorAll('meta[property^="og:"]').forEach((el) => {
        const prop = el.getAttribute("property") || "";
        const content = el.getAttribute("content") || "";
        og[prop] = content;
      });

      const twitter: Record<string, string> = {};
      document.querySelectorAll('meta[name^="twitter:"]').forEach((el) => {
        const name = el.getAttribute("name") || "";
        const content = el.getAttribute("content") || "";
        twitter[name] = content;
      });

      const structuredData: any[] = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
        try {
          structuredData.push(JSON.parse(el.innerHTML));
        } catch (e) {
          console.error("Failed to parse structured data", e);
        }
      });

      setMetadata({ title, description, canonical, og, twitter, robots, structuredData });
    }, 500);

    return () => clearTimeout(timer);
  }, [isOpen, state.location.href]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-110 active:scale-95 print:hidden"
        title="SEO Debugger"
      >
        <Search size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 z-[60] w-full max-w-md animate-in slide-in-from-left bg-white shadow-2xl print:hidden dark:bg-zinc-900 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b p-4 bg-brand text-white">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} />
          <h2 className="font-fraunces text-lg">SEO Inspector</h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-1 hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <Info size={14} /> Basic Directives
          </h3>
          <div className="rounded-lg border bg-zinc-50 p-3 text-sm dark:bg-zinc-800 space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400">Title Tag</label>
              <p className="mt-0.5 break-words font-medium">{metadata.title || "Missing"}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{metadata.title.length} chars</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400">Description</label>
              <p className="mt-0.5 break-words text-zinc-600 dark:text-zinc-300">
                {metadata.description || "Missing description tag"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{metadata.description.length} chars</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400">Canonical URL</label>
              <p className="mt-0.5 break-all text-blue-600 dark:text-blue-400">{metadata.canonical}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400">Robots</label>
              <p className="mt-0.5 font-mono text-xs">{metadata.robots}</p>
            </div>
          </div>
        </section>

        {/* Open Graph */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <ChevronRight size={14} /> Social (OG & Twitter)
          </h3>
          <div className="rounded-lg border divide-y text-xs dark:divide-zinc-700">
            {Object.entries({ ...metadata.og, ...metadata.twitter }).map(([key, val]) => (
              <div key={key} className="p-2 flex flex-col gap-1">
                <span className="font-mono text-zinc-400">{key}</span>
                <span className="break-all">{val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Structured Data */}
        <section className="space-y-3 pb-8">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <FileCode size={14} /> JSON-LD Structured Data
          </h3>
          {metadata.structuredData.length > 0 ? (
            <div className="space-y-2">
              {metadata.structuredData.map((data, idx) => (
                <div key={idx} className="rounded-lg border bg-zinc-950 p-3">
                  <pre className="text-[10px] text-emerald-400 overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 italic">No structured data found on this page.</p>
          )}
        </section>
      </div>
    </div>
  );
}
