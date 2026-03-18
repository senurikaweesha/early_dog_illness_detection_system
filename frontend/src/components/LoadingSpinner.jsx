import React, { memo } from 'react';
import PropTypes from 'prop-types';

export const LoadingSpinner = memo(({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          border-secondary border-t-transparent
          rounded-full animate-spin
        `}
      />
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

LoadingSpinner.defaultProps = {
  size: 'md',
  className: '',
};
