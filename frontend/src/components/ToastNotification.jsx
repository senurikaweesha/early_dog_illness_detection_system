import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
} from "lucide-react";
export const ToastNotification = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);
  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-success" />,
    error: <XCircleIcon className="w-5 h-5 text-danger" />,
    warning: <AlertTriangleIcon className="w-5 h-5 text-warning" />,
    info: <InfoIcon className="w-5 h-5 text-accent" />,
  };
  const borderColors = {
    success: "border-l-success",
    error: "border-l-danger",
    warning: "border-l-warning",
    info: "border-l-accent",
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: {
          duration: 0.2,
        },
      }}
      className={`bg-white shadow-lg rounded-lg p-4 flex items-start gap-3 border-l-4 ${borderColors[type]} min-w-[300px] max-w-md`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm text-gray-800 font-medium">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
