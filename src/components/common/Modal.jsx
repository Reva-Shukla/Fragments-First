import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1C2D]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      
      <div 
        className={`relative w-full ${maxWidth} bg-[#FCFBF9] border border-[#D8D2C6] rounded-3xl shadow-[0_24px_64px_rgba(23,45,70,0.25)] z-10 max-h-[90vh] flex flex-col overflow-hidden text-[#172D46]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Antique Gold to Steel Blue top accent hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-[#294D6B]" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8D2C6] bg-[#F8F6F1]/90">
          <div>
            <h3 className="font-serif-clean text-lg font-bold text-[#172D46] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#294D6B] mt-0.5 font-mono">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5E7A91] hover:text-[#172D46] hover:bg-[#E8E4DC]/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
