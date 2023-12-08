import { FontAwesomeIcon, SolidIcons } from '@openfin-react/common/src';
import { fin } from '@openfin/core';
import React from 'react';
import { useElementSize } from 'usehooks-ts';
import { MainMenu } from './MainMenu';
import './TitleBar.styles.scss';
import clsx from 'clsx';

enum EWindowState {
  NORMAL = 'NORMAL',
  MINIMIZED = 'MINIMIZED',
  MAXIMIZED = 'MAXIMIZED',
}

export const TitleBar = () => {
  const [windowState, setWindowState] = React.useState<EWindowState>(EWindowState.NORMAL);
  const [titleBarRef, { width }] = useElementSize();
  const environmentName = window.env.NAME;

  const minimizeWindow = async () => {
    const window = await fin.Window.getCurrent();
    if (!window) {
      return;
    }

    await window.minimize();
    setWindowState(EWindowState.MINIMIZED);
  };

  const maxOrRestore = async () => {
    const window = await fin.Window.getCurrent();
    if (!window) {
      return;
    }

    const windowState = await window.getState();
    if (!windowState) {
      return;
    }

    if (windowState === 'normal') {
      await window.maximize();
      setWindowState(EWindowState.MAXIMIZED);
    } else {
      await window.restore();
      setWindowState(EWindowState.NORMAL);
    }
  };

  const closeWindow = async () => {
    const window = await fin.Window.getCurrent();
    if (!window) {
      return;
    }

    await window.close();
  };

  React.useEffect(() => {
    const maximize = () => setWindowState(EWindowState.MAXIMIZED);
    const restore = () => setWindowState(EWindowState.NORMAL);

    const finWindow = fin.Window.getCurrentSync();
    finWindow.addListener('maximized', maximize);
    finWindow.addListener('restored', restore);

    return () => {
      finWindow.removeListener('maximized', maximize);
      finWindow.removeListener('restored', restore);
    };
  }, []);

  return (
    <div
      id="title-bar"
      ref={titleBarRef}
    >
      <div id="app-title-container">
        <img
          src="favicon.ico"
          width={20}
          alt="OpenFin-React"
        />
      </div>
      <MainMenu collapsed={width < 500} />
      <div className="title-bar-draggable title-bar-center-container">
        <div className="auth-info-container">
          <div className="env-name">
            <div className={clsx('env-name-tag', environmentName)}>{environmentName}</div>
          </div>
        </div>
      </div>
      <div className="buttons-wrapper">
        <button
          className="button"
          onClick={minimizeWindow}
        >
          <FontAwesomeIcon icon={SolidIcons.faWindowMinimize} />
        </button>
        <button
          className="button maximize-button"
          onClick={maxOrRestore}
        >
          <FontAwesomeIcon
            icon={windowState === EWindowState.NORMAL ? SolidIcons.faSquare : SolidIcons.faWindowRestore}
          />
        </button>
        <button
          className="button close-button"
          onClick={closeWindow}
        >
          <FontAwesomeIcon icon={SolidIcons.faXmark} />
        </button>
      </div>
    </div>
  );
};
