import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (The Dark overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* The Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-surface border border-border w-full max-w-lg p-6 rounded-lg shadow-2xl pointer-events-auto relative overflow-hidden">
              {/* Decorative Top Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-mono font-bold text-neon-blue">{title}</h3>
                <button 
                  onClick={onClose}
                  className="text-text-secondary hover:text-neon-red transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}