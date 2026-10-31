import React from 'react';

export const MetricCard = ({ title, value, change, trend = 'neutral', icon: Icon, description, subtitle }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300
      bg-gradient-to-br from-sky-400/[0.22] via-sky-600/[0.12] to-black/75
      backdrop-blur-2xl
      border border-sky-400/40 hover:border-sky-300/80
      shadow-[0_8px_32px_0_rgba(14,165,233,0.28),inset_0_1px_1.5px_rgba(255,255,255,0.45),inset_0_0_24px_rgba(56,189,248,0.18)]
      hover:shadow-[0_16px_48px_0_rgba(14,165,233,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_0_36px_rgba(56,189,248,0.32)]
      hover:-translate-y-0.5"
    >
      {/* Liquid Glass Internal Specular Refraction / Shimmer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-sky-400/[0.12] via-transparent to-white/[0.15] opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Ambient Internal Liquid Glow Spheres (Lighter Cerulean Blue) */}
      <div className="pointer-events-none absolute -top-14 -right-14 w-36 h-36 rounded-full bg-sky-400/30 blur-2xl group-hover:bg-sky-300/45 transition-all duration-500" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 w-36 h-36 rounded-full bg-sky-500/25 blur-2xl group-hover:bg-sky-400/35 transition-all duration-500" />

      {/* Top Edge Specular Glare Highlight */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-200/90 to-transparent" />

      {/* Card Header: Title & Lighter Blue Glass Icon Container */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-200/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-sky-400/25 border border-sky-300/50 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.45),inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:scale-105 group-hover:bg-sky-400/35 group-hover:border-sky-200 group-hover:shadow-[0_0_22px_rgba(56,189,248,0.7)] transition-all duration-300">
            <Icon className="w-4 h-4 drop-shadow-[0_0_6px_rgba(186,230,253,0.9)]" />
          </div>
        )}
      </div>

      {/* Metric Value & Trend Badge */}
      <div className="relative z-10 mt-3.5 flex items-baseline gap-2.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.5)]">
          {value}
        </span>
        {change && (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium backdrop-blur-md ${
              trend === 'down'
                ? 'bg-rose-500/25 border border-rose-400/50 text-rose-200 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                : 'bg-sky-400/25 border border-sky-300/50 text-sky-100 shadow-[0_0_10px_rgba(56,189,248,0.35)]'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {/* Subtitle / Description */}
      {(description || subtitle) && (
        <p className="relative z-10 mt-2 text-xs text-sky-100/80 leading-normal line-clamp-1">
          {description || subtitle}
        </p>
      )}

      {/* Bottom Liquid Glass Prism Refraction Edge */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400/30 via-sky-200/80 to-sky-400/30 opacity-70 group-hover:opacity-100 transition-opacity blur-[0.5px]" />
    </div>
  );
};
