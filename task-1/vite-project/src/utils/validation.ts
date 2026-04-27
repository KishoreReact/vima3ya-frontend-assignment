import type { ValidatorType } from '../types';

export const validateField = (
  value: any,
  validator?: ValidatorType,
  errorMessage?: string
): string | undefined => {
  const trimmed = value != null ? String(value).trim() : '';

  if (!validator || validator === 'required') {
    if (!trimmed) return errorMessage ?? 'This field is required';
    return undefined;
  }

  if (validator === 'email') {
    if (!trimmed) return errorMessage ?? 'This field is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return errorMessage ?? 'Please enter a valid email address';
    return undefined;
  }

  if (validator === 'phone') {
    if (!trimmed) return errorMessage ?? 'This field is required';
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(trimmed.replace(/\s/g, ''))) return errorMessage ?? 'Please enter a valid phone number';
    return undefined;
  }

  return undefined;
};
