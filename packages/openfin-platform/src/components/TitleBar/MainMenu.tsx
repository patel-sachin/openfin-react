import React from 'react';
import { createControlAppView, EControlAppId, isMainWindow, showDialog } from '@openfin-react/common/src';
import OpenFin, { fin } from '@openfin/core';
import clsx from 'clsx';
import { FontAwesomeIcon, SolidIcons } from '@openfin-react/common/src/icons';

const quitApplication = async () => {
  const platform = fin.Platform.getCurrentSync();
  const mainWindow = (await platform.Application.getChildWindows()).find(isMainWindow);
  if (mainWindow) {
    mainWindow.close().catch((e) => {
      console.error('Failed to quit', e);
    });
  } else {
    console.error('Failed to find main window');
  }
};

const closeWindow = () => {
  const window = fin.Window.getCurrentSync();
  window?.close().catch((e) => {
    console.error('Failed to quit', e);
  });
};

const showAboutDialog = () => {
  return showDialog({
    url: `${window.env.APP_URL}/about-dialog.html`,
    width: 480,
    height: 340,
  });
};

const menuActionToOpenFinTemplate = (action: EMainMenuAction, props?: Partial<OpenFin.MenuItemTemplate>) => ({
  label: action,
  data: action,
  ...props,
});

enum EMainMenu {
  FILE = 'File',
  CONTROLS = 'Controls',
  HELP = 'Help',
}

enum EMainMenuAction {
  QUIT = 'Quit',
  CLOSE_WINDOW = 'Close Window',
  Demo_App = 'Demo App',
  ABOUT = 'About',
}

const MainMenus: Record<EMainMenu, EMainMenuAction[]> = {
  [EMainMenu.FILE]: [
    ...(isMainWindow(fin.Window.getCurrentSync()) ? [] : [EMainMenuAction.CLOSE_WINDOW]),
    EMainMenuAction.QUIT,
  ],
  [EMainMenu.CONTROLS]: [EMainMenuAction.Demo_App],
  [EMainMenu.HELP]: [EMainMenuAction.ABOUT],
};

export const MainMenu = ({ collapsed }: { collapsed?: boolean }) => {
  const [openMenu, setOpenMenu] = React.useState<EMainMenu>();

  const handleMenuAction = React.useCallback(async (action: EMainMenuAction) => {
    switch (action) {
      case EMainMenuAction.QUIT:
        quitApplication();
        return;
      case EMainMenuAction.CLOSE_WINDOW:
        closeWindow();
        return;
      case EMainMenuAction.Demo_App:
        createControlAppView(EControlAppId.DemoApp);
        return;
      case EMainMenuAction.ABOUT:
        showAboutDialog();
        return;
      default:
        return;
    }
  }, []);

  const getTemplateForMenuAction = React.useCallback(
    (menuAction: EMainMenuAction) => menuActionToOpenFinTemplate(menuAction),
    [],
  );

  const toggleMainMenu = React.useCallback(
    (menu: EMainMenu) => async (e: React.MouseEvent<HTMLButtonElement>) => {
      const finWindow = fin.Window.getCurrentSync();
      const menuItemRect = (e.target as HTMLButtonElement).getBoundingClientRect();
      setOpenMenu(menu);

      const result = await finWindow.showPopupMenu({
        y: menuItemRect.bottom + 2,
        x: menuItemRect.left + 2,
        template: MainMenus[menu].map(getTemplateForMenuAction),
      });
      setOpenMenu(undefined);

      if (result.result === 'clicked') {
        handleMenuAction(result.data as EMainMenuAction);
      }
    },
    [handleMenuAction, getTemplateForMenuAction],
  );

  const toggleCollapsedMainMenu = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      const finWindow = fin.Window.getCurrentSync();
      const menuItemRect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();

      const allActionsTemplates: OpenFin.MenuItemTemplate[] = [];
      for (const menu in MainMenus) {
        allActionsTemplates.push(...MainMenus[menu as EMainMenu].map(getTemplateForMenuAction));
        allActionsTemplates.push({ type: 'separator' });
      }
      const result = await finWindow.showPopupMenu({
        y: menuItemRect.bottom + 2,
        x: menuItemRect.left + 2,
        template: allActionsTemplates,
      });
      setOpenMenu(undefined);

      if (result.result === 'clicked') {
        handleMenuAction(result.data as EMainMenuAction);
      }
    },
    [handleMenuAction, getTemplateForMenuAction],
  );

  return (
    <div className="main-menu-bar">
      {!collapsed &&
        Object.keys(MainMenus)
          .filter((menu): menu is EMainMenu => !!menu)
          .map((menu) => (
            <button
              key={menu}
              className={clsx('main-menu-button', { active: openMenu === menu })}
              onClick={toggleMainMenu(menu)}
            >
              {menu}
            </button>
          ))}

      {collapsed && (
        <button
          className="main-menu-button"
          onClick={toggleCollapsedMainMenu}
        >
          <FontAwesomeIcon icon={SolidIcons.faBars} />
        </button>
      )}
    </div>
  );
};
