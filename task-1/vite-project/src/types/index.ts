export type ValidatorType = 'email' | 'phone' | 'required';

export interface FormInputProps {
  name: string;
  value: string;
  placeholder: string;
  label: string;
  type?: string;
  validator?: ValidatorType;
  errorMessage?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  submitAttempted: boolean;
}

export interface FormValues {
  // Section A - Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;

  // Section B - Contact Details
  email: string;
  phone: string;
  address: string;

  // Section C - Professional Info
  jobTitle: string;
  company: string;
  yearsExperience: string;

  // Section D - Preferences
  preferredContact: string;
  newsletter: string;
  referralSource: string;
}

export interface SectionConfig {
  id: string;
  label: string;
  title: string;
  subtitle: string;
}
