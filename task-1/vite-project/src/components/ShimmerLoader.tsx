import React from 'react';

const ShimmerLoader: React.FC = () => {
  return (
    <div className="shimmer-overlay">
      <div className="shimmer-card">
        <div className="shimmer-header">
          <div className="shimmer-icon shimmer-anim" />
          <div className="shimmer-title-group">
            <div className="shimmer-bar shimmer-bar--lg shimmer-anim" />
            <div className="shimmer-bar shimmer-bar--sm shimmer-anim" />
          </div>
        </div>
        <div className="shimmer-content">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer-row">
              <div className="shimmer-label shimmer-anim" />
              <div className="shimmer-field shimmer-anim" style={{ width: `${70 + i * 7}%` }} />
            </div>
          ))}
        </div>
        <div className="shimmer-footer">
          <div className="shimmer-badge shimmer-anim" />
          <div className="shimmer-bar shimmer-bar--md shimmer-anim" />
        </div>
        <p className="shimmer-text">Submitting your information…</p>
      </div>
    </div>
  );
};

export default ShimmerLoader;
