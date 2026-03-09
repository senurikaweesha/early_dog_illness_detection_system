import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
export const EmptyState = ({
  icon,
  heading,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="card text-center py-16 max-w-2xl mx-auto flex flex-col items-center justify-center"
    >
      <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6 text-secondary">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-primary mb-2">{heading}</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">{message}</p>
      {actionLabel && onAction && (
        <Button size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
