import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  iconBg = 'bg-gradient-to-br from-primary-500 to-neon-pink',
  children,
  footer,
  size = 'md'
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up`}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-600 via-neon-pink to-neon-yellow"></div>

            <div className="px-6 pt-6 pb-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {icon && (
                    <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center text-white text-lg shadow-glow shrink-0`}>
                      {icon}
                    </div>
                  )}
                  <div>
                    {title && (
                      <h2 className="font-display text-xl text-slate-900 leading-tight">{title}</h2>
                    )}
                    {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0"
                  aria-label="Close"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 sm:px-7 max-h-[70vh] overflow-y-auto -mt-2">{children}</div>

            {footer && (
              <div className="px-6 py-4 sm:px-7 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;