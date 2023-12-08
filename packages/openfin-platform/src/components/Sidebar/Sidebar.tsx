import { Button } from '@blueprintjs/core';
import { fin } from '@openfin/core';
import React from 'react';
import './Sidebar.scss';
import { WINDOW_LAYOUT_CONFIG_VIEW_NAME } from '../../common/constants';
import { focusExistingOrOpenNewView } from '../../utils/openfinUtils';

async function showWindowLayoutConfigInView() {
  focusExistingOrOpenNewView(WINDOW_LAYOUT_CONFIG_VIEW_NAME);
}

export const Sidebar = () => {
  const [windowConfig, setWindowConfig] = React.useState<unknown>(null);

  React.useEffect(() => {
    const testLayoutConfig = async () => {
      const window = fin.Window.getCurrentSync();
      const layout = await window.getLayout();
      const config = await layout.getConfig();
      console.log(config);
      setWindowConfig(config);
    };

    testLayoutConfig();
  }, []);

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
              onClick={() => showWindowLayoutConfigInView()}
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
