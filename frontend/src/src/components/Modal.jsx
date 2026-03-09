import React, { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";
export const Modal = memo(({ isOpen, onClose, title, children, size = "md" }) => {
  const modalRef = useRef(null);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <motion.div
            ref={modalRef}
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} relative z-10 max-h-[90vh] flex flex-col`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 id="modal-title" className="text-xl font-bold text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

Modal.displayName = 'Modal';

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};

Modal.defaultProps = {
  size: 'md',
};
