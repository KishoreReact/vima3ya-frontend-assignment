import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import type { FormValues, SectionConfig } from './types';
import { validateField } from './utils/validation';
import { useScrollSpy } from './hooks/useScrollSpy';
import Sidebar from './components/Sidebar';
import FormInput from './components/FormInput';
import FormSection from './components/FormSection';
import ShimmerLoader from './components/ShimmerLoader';
import './styles.css';

const SECTIONS: SectionConfig[] = [
  { id: 'section-a', label: 'Section A', title: 'Personal Info', subtitle: 'Personal Info' },
  { id: 'section-b', label: 'Section B', title: 'Contact Details', subtitle: 'Contact Details' },
  { id: 'section-c', label: 'Section C', title: 'Professional Info', subtitle: 'Professional Info' },
  { id: 'section-d', label: 'Section D', title: 'Preferences', subtitle: 'Preferences' },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  jobTitle: '',
  company: '',
  yearsExperience: '',
  preferredContact: '',
  newsletter: '',
  referralSource: '',
};

const onFormComplete = () => {
  console.log('✅ onFormComplete() triggered — all fields valid');
};

const App: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const shimmerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highestReached = useScrollSpy(SECTION_IDS, scrollRef as React.RefObject<HTMLElement | null>);

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};

    const check = (key: keyof FormValues, validator?: 'email' | 'phone' | 'required', msg?: string) => {
      const err = validateField(values[key], validator, msg);
      if (err) errors[key] = err;
    };

    check('firstName', 'required');
    check('lastName', 'required');
    check('dateOfBirth', 'required');
    check('email', 'email');
    check('phone', 'phone');
    check('address', 'required');
    check('jobTitle', 'required');
    check('company', 'required');
    check('yearsExperience', 'required');
    check('preferredContact', 'required');
    check('newsletter', 'required');
    check('referralSource', 'required');

    return errors;
  };

  const triggerShimmer = useCallback(() => {
    if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
    setShowShimmer(true);
    shimmerTimerRef.current = setTimeout(() => setShowShimmer(false), 3000);
  }, []);

  const formik = useFormik({
    initialValues,
    validate,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: () => {
      onFormComplete();
      triggerShimmer();
    },
  });

  // Auto-trigger onFormComplete when all valid after submit attempted
  useEffect(() => {
    if (!submitAttempted) return;
    const hasErrors = Object.keys(validate(formik.values)).length > 0;
    if (!hasErrors) {
      onFormComplete();
      triggerShimmer();
    }
  }, [formik.values, submitAttempted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    formik.handleSubmit(e as React.FormEvent<HTMLFormElement>);
  };

  const handleNavClick = (id: string) => {
    const el = scrollRef.current?.querySelector(`[data-section-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const makeInputProps = (
    name: keyof FormValues,
    label: string,
    placeholder: string,
    validator?: 'email' | 'phone' | 'required',
    type = 'text',
    errorMessage?: string
  ) => ({
    name,
    label,
    placeholder,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.errors[name],
    touched: formik.touched[name],
    submitAttempted,
    validator,
    type,
    errorMessage,
  });

  return (
    <div className="app">
      {showShimmer && <ShimmerLoader />}

      <Sidebar
        sections={SECTIONS}
        highestReached={highestReached}
        onNavClick={handleNavClick}
      />

      <main className="main-content">
        <div className="scroll-container" ref={scrollRef}>
          <div className="page-header">
            <h1 className="page-title">Registration Form</h1>
            <p className="page-subtitle">Complete all sections below to submit your information</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── SECTION A ── */}
            <FormSection id="section-a" label="Section A" title="Personal Information" icon="◈">
              <div className="fields-grid">
                <FormInput {...makeInputProps('firstName', 'First Name', 'e.g. Alexandra', 'required')} />
                <FormInput {...makeInputProps('lastName', 'Last Name', 'e.g. Chen', 'required')} />
                <FormInput
                  {...makeInputProps('dateOfBirth', 'Date of Birth', 'YYYY-MM-DD', 'required', 'date')}
                />
              </div>
            </FormSection>

            {/* ── SECTION B ── */}
            <FormSection id="section-b" label="Section B" title="Contact Details" icon="◉">
              <div className="fields-grid">
                <FormInput {...makeInputProps('email', 'Email Address', 'you@example.com', 'email', 'email')} />
                <FormInput {...makeInputProps('phone', 'Phone Number', '+1 (555) 000-0000', 'phone', 'tel')} />
                <FormInput
                  {...makeInputProps('address', 'Street Address', '123 Main St, City, State', 'required')}
                />
              </div>
            </FormSection>

            {/* ── SECTION C ── */}
            <FormSection id="section-c" label="Section C" title="Professional Information" icon="◍">
              <div className="fields-grid">
                <FormInput {...makeInputProps('jobTitle', 'Job Title', 'e.g. Product Designer', 'required')} />
                <FormInput {...makeInputProps('company', 'Company / Organization', 'e.g. Acme Inc.', 'required')} />
                <FormInput
                  {...makeInputProps('yearsExperience', 'Years of Experience', 'e.g. 5', 'required', 'number')}
                />
              </div>
            </FormSection>

            {/* ── SECTION D ── */}
            <FormSection id="section-d" label="Section D" title="Preferences" icon="◎">
              <div className="fields-grid">
                <FormInput
                  {...makeInputProps('preferredContact', 'Preferred Contact Method', 'Email / Phone / SMS', 'required')}
                />
                <FormInput
                  {...makeInputProps('newsletter', 'Subscribe to Newsletter?', 'Yes / No', 'required')}
                />
                <FormInput
                  {...makeInputProps('referralSource', 'How did you hear about us?', 'e.g. Google, Friend, LinkedIn', 'required')}
                />
              </div>
            </FormSection>

            <div className="form-footer">
              <div className="footer-info">
                <span className="footer-count">
                  {Object.keys(validate(formik.values)).length === 0
                    ? '✓ All fields complete'
                    : `${12 - Object.keys(validate(formik.values)).length} / 12 fields completed`}
                </span>
              </div>
              <button type="submit" className="submit-btn">
                <span className="btn-text">Submit Form</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default App;
