import React from 'react';
import type { SectionConfig } from '../types';

interface SidebarProps {
  sections: SectionConfig[];
  highestReached: number;
  onNavClick: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, highestReached, onNavClick }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <p className="brand-label">Form System</p>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-heading">Navigation</p>
          <ul className="nav-list">
            {sections.map((section, idx) => {
              const isActive = idx <= highestReached;
              return (
                <li key={section.id} className="nav-item">
                  <button
                    className={`nav-bullet ${isActive ? 'nav-bullet--active' : ''}`}
                    onClick={() => onNavClick(section.id)}
                    type="button"
                  >
                    <span className="bullet-indicator">
                      <span className="bullet-ring" />
                      <span className="bullet-dot" />
                      {isActive && <span className="bullet-check">✓</span>}
                    </span>
                    <span className="bullet-label">
                      <span className="bullet-section-tag">{section.label}</span>
                      <span className="bullet-title">{section.subtitle}</span>
                    </span>
                  </button>
                  {idx < sections.length - 1 && (
                    <span className={`nav-connector ${idx < highestReached ? 'nav-connector--active' : ''}`} />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Fill all sections to<br />complete submission</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
