import React from "react";
import { motion } from "framer-motion";
export const StatsCard = ({
  title,
  value,
  icon,
  bg = "bg-secondary/10",
  delay = 0,
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
      transition={{
        delay,
      }}
      className="card flex items-center gap-4"
    >
      <div className={`p-4 rounded-xl ${bg}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className="text-lg font-bold text-primary">{value}</p>
      </div>
    </motion.div>
  );
};
