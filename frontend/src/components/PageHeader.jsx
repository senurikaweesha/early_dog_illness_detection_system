import React from "react";
import { motion } from "framer-motion";
export const PageHeader = ({ heading, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <motion.div
        initial={{
          opacity: 0,
          x: -20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
      >
        <h1 className="text-3xl font-bold text-primary mb-2">{heading}</h1>
        <p className="text-gray-600">{description}</p>
      </motion.div>

      {action && (
        <motion.div
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
};
