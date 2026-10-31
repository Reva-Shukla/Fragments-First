import React from 'react';

export const Badge = ({ variant = 'default', children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 font-semibold rounded-xl'
  }[size] || 'text-xs px-2.5 py-1 font-medium rounded-lg';

  const variantStyles = {
    // 4-Tier Claim verification statuses (Cerulean Blue & Neon Rose Only)
    SUPPORTED: 'bg-sky-950/40 backdrop-blur-md text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(14,165,233,0.3)]',
    CONTRADICTED: 'bg-rose-950/50 backdrop-blur-md text-rose-300 border border-rose-500/60 shadow-[0_0_15px_rgba(255,0,127,0.35)] font-semibold',
    'PARTIALLY SUPPORTED': 'bg-rose-950/30 backdrop-blur-md text-sky-200 border border-rose-400/40 shadow-[0_0_10px_rgba(255,0,127,0.2)]',
    UNVERIFIED: 'bg-black/60 backdrop-blur-md text-slate-300 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]',

    // Case statuses (Cerulean Blue & Neon Rose Only)
    'Active Investigation': 'bg-sky-950/40 backdrop-blur-md text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(14,165,233,0.25)]',
    'Verification Phase': 'bg-rose-950/40 backdrop-blur-md text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(255,0,127,0.25)]',
    'Pending Review': 'bg-rose-950/40 backdrop-blur-md text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(255,0,127,0.2)]',
    'Completed': 'bg-sky-950/40 backdrop-blur-md text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(14,165,233,0.25)]',
    'Intake': 'bg-black/60 backdrop-blur-md text-slate-400 border border-white/10',

    // Priority
    HIGH: 'bg-rose-950/60 backdrop-blur-md text-rose-300 border border-rose-500/60 shadow-[0_0_14px_rgba(255,0,127,0.3)] font-mono',
    MEDIUM: 'bg-sky-950/50 backdrop-blur-md text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(14,165,233,0.2)] font-mono',
    LOW: 'bg-black/60 backdrop-blur-md text-slate-400 border border-white/10 font-mono',

    // Clearance
    RESTRICTED: 'bg-rose-950/40 backdrop-blur-md text-rose-300 border border-rose-500/40 font-mono shadow-[0_0_10px_rgba(255,0,127,0.2)]',
    CONFIDENTIAL: 'bg-sky-950/40 backdrop-blur-md text-sky-300 border border-sky-400/50 font-mono shadow-[0_0_10px_rgba(14,165,233,0.2)]',
    'TOP SECRET': 'bg-rose-950/70 backdrop-blur-md text-rose-200 border border-rose-500/70 font-mono font-bold tracking-wider shadow-[0_0_16px_rgba(255,0,127,0.4)]',

    // General (Jet Black, Cerulean, Neon Rose Only)
    default: 'bg-black/60 backdrop-blur-md text-slate-300 border border-white/10',
    success: 'bg-sky-950/40 backdrop-blur-md text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(14,165,233,0.25)]',
    warning: 'bg-rose-950/40 backdrop-blur-md text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(255,0,127,0.2)]',
    danger: 'bg-rose-950/50 backdrop-blur-md text-rose-300 border border-rose-500/60 shadow-[0_0_12px_rgba(255,0,127,0.3)]',
    info: 'bg-sky-950/40 backdrop-blur-md text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(14,165,233,0.25)]'
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} ${style} ${className}`}>
      {children}
    </span>
  );
};
