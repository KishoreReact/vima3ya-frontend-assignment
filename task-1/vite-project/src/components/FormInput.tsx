import React from 'react';
import type { FormInputProps } from '../types';

const FormInput: React.FC<FormInputProps> = ({
  name,
  value,
  placeholder,
  label,
  type = 'text',
  onChange,
  onBlur,
  error,
  touched,
  submitAttempted,
}) => {
  const showError = submitAttempted && !!error;

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <div className={`input-wrapper ${showError ? 'input-error' : ''} ${value ? 'input-filled' : ''}`}>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className="form-input"
          autoComplete="off"
        />
        <span className="input-line" />
      </div>
      <div className={`error-message ${showError ? 'error-visible' : ''}`}>
        {showError && (
          <>
            <span className="error-icon">!</span>
            {error}
          </>
        )}
      </div>
    </div>
  );
};

export default FormInput;
