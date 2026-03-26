import React, { memo } from "react";
import PropTypes from "prop-types";
export const Textarea = memo(({
  label,
  error,
  className = "",
  id,
  required,
  ...props
}) => {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={textareaId}
        className="block text-sm font-bold text-blue-900 mb-1 tracking-wider"
      >
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <textarea
        id={textareaId}
        className={`input-field w-full min-h-[100px] resize-y ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""}`}
        required={required}
        {...props}
      />

      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
};

Textarea.defaultProps = {
  className: '',
  required: false,
};
