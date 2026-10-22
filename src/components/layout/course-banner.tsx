"use client";

import { useState } from "react";
import { BarChart3, BookOpen, Briefcase, Code2, Palette, Smartphone, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// [from, to] gradient colours per category. Purple is deliberately not used.
const palettes: Record<string, [string, string]> = {
  "Web Development": ["#0f766e", "#0ea5e9"],
  "Data Science": ["#047857", "#84cc16"],
  Design: ["#be123c", "#f59e0b"],
  Business: ["#1d4ed8", "#0891b2"],
  Mobile: ["#b45309", "#e11d48"],
};
const fallbackPalettes: [string, string][] = [
  ["#0f766e", "#14b8a6"],
  ["#0369a1", "#0ea5e9"],
  ["#15803d", "#65a30d"],
  ["#b45309", "#f59e0b"],
];

const icons: Record<string, LucideIcon> = {
  "Web Development": Code2,
  "Data Science": BarChart3,
  Design: Palette,
  Business: Briefcase,
  Mobile: Smartphone,
};

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Course banner. Uses the instructor's thumbnail when there is one, otherwise a generated
 * artwork (gradient, soft shapes and a category icon) that is unique per course.
 */
export function CourseBanner({
  title,
  category,
  thumbnailUrl,
  className,
}: {
  title: string;
  category: string;
  thumbnailUrl?: string | null;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (thumbnailUrl && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={thumbnailUrl} alt="" onError={() => setBroken(true)} className={cn("h-32 w-full object-cover", className)} />;
  }

  const h = hash(title);
  const [from, to] = palettes[category] ?? fallbackPalettes[h % fallbackPalettes.length];
  const Icon = icons[category] ?? BookOpen;
  // Per-course variation: where the big soft circle and the dot grid sit.
  const cx = 15 + (h % 70);
  const cy = 10 + ((h >> 3) % 80);
  const r = 40 + ((h >> 6) % 30);
  const id = `b${h}`;

  return (
    <div
      aria-hidden
      className={cn("relative h-32 w-full overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.7" fill="#fff" fillOpacity="0.35" />
          </pattern>
        </defs>
        <rect width="100" height="50" fill={`url(#${id})`} />
        <circle cx={cx} cy={cy / 2} r={r / 2.2} fill="#fff" fillOpacity="0.12" />
        <circle cx={100 - cx / 2} cy={50 - cy / 3} r={r / 4} fill="#fff" fillOpacity="0.14" />
        <path d={`M0 ${38 + (h % 8)} Q 25 ${30 + (h % 10)} 50 ${40} T 100 ${34 + (h % 8)} V50 H0 Z`} fill="#fff" fillOpacity="0.14" />
      </svg>
      <div className="relative flex h-full items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-sm">
          <Icon className="h-8 w-8" />
        </span>
      </div>
    </div>
  );
}
