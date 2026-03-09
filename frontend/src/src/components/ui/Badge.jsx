import React, { memo } from "react";
import PropTypes from "prop-types";
export const Badge = memo(({ variant, children, className = "" }) => {
  const variantClasses = {
    normal: "badge-normal",
    abnormal: "badge-abnormal",
    low: "badge-low",
    medium: "badge-medium",
    high: "badge-high",
    pending:
      "bg-warning/10 text-warning-dark font-medium px-2.5 py-0.5 rounded-full text-xs",
    reviewed:
      "bg-success/10 text-success-dark font-medium px-2.5 py-0.5 rounded-full text-xs",
  };
  return (
    <span
      className={`inline-flex items-center justify-center ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['normal', 'abnormal', 'low', 'medium', 'high', 'pending', 'reviewed']),
  className: PropTypes.string,
};

Badge.defaultProps = {
  variant: 'normal',
  className: '',
};
