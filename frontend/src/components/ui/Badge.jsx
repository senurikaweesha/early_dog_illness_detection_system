import React from 'react';
import PropTypes from 'prop-types';

export const Badge = ({ variant, children, className = '' }) => {
  const variants = {
    // Classification badges - Bold with square design
    normal: 'bg-green-50 text-green-700 border-2 border-green-100 font-bold',
    abnormal: 'bg-red-50 text-red-700 border-2 border-red-100 font-bold',
    
    // Urgency badges - Square design
    low: 'bg-blue-50 text-blue-700 border border-blue-200',
    moderate: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    medium: 'bg-orange-50 text-orange-600 border border-orange-200',
    high: 'bg-red-50 text-red-700 border border-red-200',
    
    // Default
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  // Changed: rounded-full → rounded (square/rectangular boxes)
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded text-xs uppercase tracking-wide';
  const variantClasses = variants[variant] || variants.default;

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  variant: PropTypes.oneOf([
    'normal',
    'abnormal',
    'low',
    'moderate',
    'medium',
    'high',
    'default',
  ]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Badge.defaultProps = {
  variant: 'default',
  className: '',
};