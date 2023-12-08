import React from 'react';
import {
  IpcContextProvider,
  isMainWindow,
  useIpcContext,
} from '@openfin-react/common/src';
import { createRoot } from 'react-dom/client';
import { TitleBar } from './TitleBar/TitleBar';
import { Sidebar } from './Sidebar/Sidebar';
import OpenFin, { fin } from '@openfin/core';
import { LEFT_MENU_CONTAINER_ID } from '../common/constants';
import './Platform.scss';

const PLATFORM_WINDOW_IDENTIFIER = 'platform';
const PlatformApp = () => {
  const [isPostSetupComplete, setIsPostSetupComplete] = React.useState(false);

  const { ipcBusSubscriber } = useIpcContext();

  const isOnMainWindow = isMainWindow(fin.Window.getCurrentSync());

  React.useEffect(() => {
    async function runPostPlatformSetup() {
      if (!ipcBusSubscriber || isPostSetupComplete) {
        return;
      }

      try {
        console.log('>> Platform | 001 | calling fin.Platform.Layout.init');
        await fin.Platform.Layout.init({ containerId: LEFT_MENU_CONTAINER_ID });
        console.log('>> Platform | 002 | fin.Platform.Layout.init complete');
      } catch (error) {
        console.log(`>>> Platform | 003 | fin.Platform.Layour.init failed | ${error}`);
      }

      const finWindow = fin.Window.getCurrentSync();

      await fin.InterApplicationBus.subscribe({ uuid: '*' }, 'bringToFront', async () => {
        await finWindow.bringToFront();
      });

      setIsPostSetupComplete(true);
    }

    runPostPlatformSetup().catch((err) => console.error('runPostPlatformSetup error', err));
  }, [ipcBusSubscriber, isPostSetupComplete]);

  return (
    <div id="of-frame-main">
      <TitleBar />

      <div className="main">
        {isPostSetupComplete && <Sidebar />}

        <div className="content">
          <div id="body-container">
            <div
              id="outer-layout-container"
              className="bp4-dark"
            >
              <div
                id="layout-container"
                className="face"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById(PLATFORM_WINDOW_IDENTIFIER);

if (!container) {
  throw Error(`cannot find container with id = ${PLATFORM_WINDOW_IDENTIFIER}`);
}

const content = (
  <IpcContextProvider identifier={PLATFORM_WINDOW_IDENTIFIER}>
      <PlatformApp />
  </IpcContextProvider>
);

const root = createRoot(container);
root.render(content);
