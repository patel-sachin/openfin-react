import React from 'react';
import { createRoot } from 'react-dom/client';

const DemoApp = () => {
  return (
    <div className="root-container">
      <h2>OpenFin React Demo</h2>
    </div>
  );
};

const container = document.getElementById('app');
if (!container) {
  throw Error(`cannot find container with id = 'app'`);
}

const root = createRoot(container);
root.render(<DemoApp />);
