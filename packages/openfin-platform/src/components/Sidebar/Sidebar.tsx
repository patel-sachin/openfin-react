import { Button } from '@blueprintjs/core';
import { fin } from '@openfin/core';
import React from 'react';
import './Sidebar.scss';

export const Sidebar = ({ isPlatformInitialized }: { isPlatformInitialized: boolean }) => {
  const [windowConfig, setWindowConfig] = React.useState<unknown>(null);

  React.useEffect(() => {
    const testLayoutConfig = async () => {
      const window = fin.Window.getCurrentSync();
      const layout = await window.getLayout();
      const config = await layout.getConfig();
      console.log(config);
      setWindowConfig(config);
    };

    if (isPlatformInitialized) {
      testLayoutConfig();
    }
  }, [isPlatformInitialized]);

  const hasWindowConfig = !!windowConfig;

  return (
    <div
      id="sidebar"
      className="sidebar"
    >
      <div className="sidebar-contents">
        <ul className="actions-container">
          <li className="action-item">Item-1</li>
          <li className="action-item">Item-2</li>
          <li className="action-item">Item-3</li>
          <li className="action-item">Item-4</li>
          <li className="action-item">Item-5</li>
        </ul>
        <div className="window-config-container">
          {hasWindowConfig && (
            <Button
              className="show-window-config-button"
            >
              Show Window Config
            </Button>
          )}
          {!hasWindowConfig && (
            <p
              className="no-window-config-label"
            >
              Window config Not Available!
            </p>
          )}

        </div>
      </div>
    </div>
  );
};
