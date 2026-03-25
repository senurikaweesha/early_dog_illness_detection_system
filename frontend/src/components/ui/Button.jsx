import React, { forwardRef, memo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { LoadingSpinner } from "../LoadingSpinner";

export const Button = memo(forwardRef((
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    icon,
    className = "",
    disabled = false,
    type = 'button',
    ...props
  }, ref) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary:
      "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary shadow-sm",
    secondary:
      "bg-white text-secondary border-2 border-secondary hover:bg-secondary hover:text-white focus:ring-secondary",
    danger:
      "bg-danger text-white hover:bg-danger-dark focus:ring-danger shadow-sm",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200",
  };
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass =
    disabled || loading
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "";
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={
        disabled || loading
          ? {}
          : {
            scale: 0.98,
          }
      }
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" className="mr-2 text-current" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}));

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};