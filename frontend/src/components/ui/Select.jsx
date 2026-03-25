import React, { memo } from "react";
import PropTypes from "prop-types";
export const Select = memo(({
  label,
  options,
  error,
  className = "",
  id,
  required,
  ...props
}) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={selectId}
        className="block text-sm font-bold text-blue-900 mb-1"
      >
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <select
        id={selectId}
        className={`input-field appearance-none bg-white ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""}`}
        required={required}
        {...props}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
};

Select.defaultProps = {
  className: '',
  required: false,
};
