import React from 'react';

const Preview: React.FC = () => {
  return (
    <div className="preview">
      <div className="preview-header">Preview</div>
      <div className="preview-content">
        <div className="contract-events">
          <h3>Live Events</h3>
          <div className="event-item">• swap 100 USDC → 98.7 XLM</div>
          <div className="event-item">• mint 1000 TOKEN</div>
        </div>
        <button className="action-btn">Run</button>
        <button className="action-btn">Stop</button>
      </div>
    </div>
  );
};

export default Preview;
