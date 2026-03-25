import React, { forwardRef, useId, memo } from "react";
import PropTypes from "prop-types";
export const Input = memo(forwardRef(({
  label,
  error,
  icon,
  className = "",
  containerClassName = "",
  required = false,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-bold text-blue-900 mb-1"
        >
          {label} {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`input-field ${icon ? "pl-10" : ""} ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""} ${className}`}
          required={required}
          {...props}
        />
      </div>
      {error && <p id={`${inputId}-error`} className="mt-1 text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}));

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
};

Input.defaultProps = {
  className: '',
  containerClassName: '',
  required: false,
};
