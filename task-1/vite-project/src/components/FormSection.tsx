import React from 'react';

interface FormSectionProps {
  id: string;
  label: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ id, label, title, icon, children }) => {
  return (
    <section className="form-section" data-section-id={id}>
      <div className="section-header">
        <div className="section-tag">
          <span className="section-icon">{icon}</span>
          <span className="section-label">{label}</span>
        </div>
        <h2 className="section-title">{title}</h2>
        <div className="section-divider" />
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
};

export default FormSection;
