import { fin } from '@openfin/core';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './WindowConfigApp.scss';

const WindowConfigApp = () => {
  const [config, setConfig] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        // https://developers.openfin.co/of-docs/docs/organize-views-with-layouts#how-to-capture-a-layout
        const window = fin.Window.getCurrentSync();
        const layout = await fin.Platform.Layout.wrap(window.identity);
        const layoutConfig = await layout.getConfig();
        if (!config) {
          setConfig('No config found');
          return;
        }
        setConfig(JSON.stringify(layoutConfig, null, 4));
      } catch (err) {
        setConfig(err as string);
      }
    };
    loadConfig();
  }, []);

  return (
    <div className="container">
      <textarea
        className="config-text-area"
        readOnly={true}
        value={config ?? 'Null'}
      />
    </div>
  );
};

const container = document.getElementById('app');
if (!container) {
  throw Error(`cannot find container with id = 'app'`);
}

const root = createRoot(container);
root.render(<WindowConfigApp />);
