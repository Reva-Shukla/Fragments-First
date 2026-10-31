import React from 'react';

export const Badge = ({ variant = 'default', children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 font-semibold rounded-xl'
  }[size] || 'text-xs px-2.5 py-1 font-medium rounded-lg';

  const variantStyles = {
    // 4-Tier Claim verification statuses (Midnight Trust highlights)
    SUPPORTED: 'bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 font-semibold shadow-2xs',
    CONTRADICTED: 'bg-[#FDF0EE] text-[#9B2C2C] border border-[#E8B4B4] font-semibold shadow-2xs',
    'PARTIALLY SUPPORTED': 'bg-[#FAF6EF] text-[#8E6E3C] border border-[#C5A77B]/60 font-semibold shadow-2xs',
    UNVERIFIED: 'bg-[#E8E4DC]/60 text-[#5E7A91] border border-[#D8D2C6]',

    // Case statuses
    'Active Investigation': 'bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 font-semibold shadow-2xs',
    'Verification Phase': 'bg-[#FAF6EF] text-[#8E6E3C] border border-[#C5A77B]/60 font-semibold shadow-2xs',
    'Pending Review': 'bg-[#FAF6EF] text-[#8E6E3C] border border-[#C5A77B]/60 font-semibold shadow-2xs',
    'Completed': 'bg-[#E8F5F1] text-[#1E6B52] border border-[#A3D9C9] font-semibold shadow-2xs',
    'Intake': 'bg-[#E8E4DC]/60 text-[#5E7A91] border border-[#D8D2C6]',

    // Priority (High is Antique Gold, Medium is Steel Blue, Low is Muted Blue)
    HIGH: 'bg-[#C5A77B] text-[#172D46] border border-[#A88A5E] font-bold shadow-2xs',
    MEDIUM: 'bg-[#294D6B] text-[#E8E4DC] border border-[#172D46] font-semibold shadow-2xs',
    LOW: 'bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 font-medium',

    // Clearance
    RESTRICTED: 'bg-[#FDF0EE] text-[#9B2C2C] border border-[#E8B4B4] font-semibold',
    CONFIDENTIAL: 'bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 font-semibold',
    'TOP SECRET': 'bg-[#C5A77B] text-[#172D46] border border-[#A88A5E] font-bold',

    // General
    default: 'bg-[#E8E4DC]/60 text-[#5E7A91] border border-[#D8D2C6]',
    success: 'bg-[#E8F5F1] text-[#1E6B52] border border-[#A3D9C9] font-semibold',
    warning: 'bg-[#FAF6EF] text-[#8E6E3C] border border-[#C5A77B]/60 font-semibold',
    danger: 'bg-[#FDF0EE] text-[#9B2C2C] border border-[#E8B4B4] font-semibold',
    info: 'bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 font-semibold'
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} ${style} ${className}`}>
      {children}
    </span>
  );
};
