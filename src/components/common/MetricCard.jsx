import React from 'react';

export const MetricCard = ({ title, value, change, trend = 'neutral', icon: Icon, description, subtitle }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300
      bg-gradient-to-br from-[#172D46] via-[#1B3654] to-[#122438]
      border border-[#294D6B]/70 hover:border-[#C5A77B]/80
      shadow-[0_8px_30px_rgba(23,45,70,0.3)]
      hover:shadow-[0_12px_40px_rgba(23,45,70,0.45)]
      hover:-translate-y-1"
    >
      {/* Ambient Internal Glow matching Images 2 & 3 */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#8FAFC4]/15 blur-2xl group-hover:bg-[#8FAFC4]/25 transition-all duration-500" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#C5A77B]/10 blur-2xl" />

      {/* Subtle Antique Gold Top Border Highlight */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent group-hover:via-[#C5A77B]/80 transition-all duration-300" />

      {/* Delicate Watermark Line-Art Illustration on bottom-right */}
      {Icon && (
        <div className="pointer-events-none absolute -bottom-3 -right-3 text-[#C5A77B] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500">
          <Icon className="w-24 h-24 stroke-[1.2]" />
        </div>
      )}

      {/* Card Header: Title in Antique Gold & Outlined Icon */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#C5A77B]">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-2xl bg-[#294D6B]/60 border border-[#C5A77B]/60 text-[#C5A77B] group-hover:scale-105 group-hover:border-[#C5A77B] group-hover:shadow-[0_0_12px_rgba(197,167,123,0.3)] transition-all duration-300 shadow-2xs">
            <Icon className="w-4 h-4 stroke-[2]" />
          </div>
        )}
      </div>

      {/* Metric Value & Soft Ivory / Antique Gold Trend Pill */}
      <div className="relative z-10 mt-3.5 flex items-baseline gap-2.5 flex-wrap">
        <span className="font-serif-clean text-3xl sm:text-4xl font-extrabold tracking-tight text-[#E8E4DC] drop-shadow-sm">
          {value}
        </span>
        {change && (
          <span
            className="px-3 py-0.5 rounded-full text-[11px] font-sans font-bold bg-[#E8E4DC] text-[#172D46] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          >
            {change}
          </span>
        )}
      </div>

      {/* Subtitle / Description in Muted Blue */}
      {(description || subtitle) && (
        <p className="relative z-10 mt-2 font-sans text-xs text-[#8FAFC4] leading-normal line-clamp-1 italic font-medium">
          {description || subtitle}
        </p>
      )}
    </div>
  );
};
