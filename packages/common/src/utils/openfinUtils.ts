import OpenFin, { fin } from '@openfin/core';
import { first, inRange, isEqual } from 'lodash';
import {
  ControlApps,
  EControlAppEntryName,
  EControlAppId,
} from '../types';
import { getUuid } from './uuidUtils';

export async function getOpenFinIdentityAsync(): Promise<OpenFin.Identity | null> {
  let windowIdentity: OpenFin.Identity | null = null;

  if (fin.me.isWindow) {
    windowIdentity = fin.me.identity;
  } else if (fin.me.isView) {
    const window = await fin.me.getCurrentWindow();
    if (window) {
      windowIdentity = window.identity;
    }
  }

  return windowIdentity;
}

export const isOpenFin = () => fin?.me?.isOpenFin ?? false;

export async function getOpenFinProcessIdAsync(): Promise<number | null> {
  const processInfo = await fin.me.getProcessInfo();
  return processInfo ? processInfo.pid : null;
}

export const isMainWindow = (window: OpenFin.Window): boolean => {
  if (!window) {
    return false;
  }

  return !window.identity.name.includes('internal-generated-window');
};

export const POPUP_WINDOW_DEFAULT_OPTIONS: Partial<OpenFin.PopupOptions> = {
  focus: true,
  resultDispatchBehavior: 'close',
  blurBehavior: 'modal',
  initialOptions: {
    frame: true,
    minimizable: false,
    resizable: false,
    backgroundColor: '#131415',
    shadow: true,
    defaultCentered: true,
    includeInSnapshots: false,
    saveWindowState: false,
    alwaysOnTop: false,
  },
};

export interface DialogResult {
  popupWindow: OpenFin.Window | undefined;
  popupResult: OpenFin.PopupResult;
}

export const showDialog = async (options: Partial<OpenFin.PopupOptions>): Promise<DialogResult> => {
  const finWindow = fin.Window.getCurrentSync();
  const bounds = await getWindowBounds(finWindow);
  const x = bounds.width / 2 - (options.width ?? 0) / 2;
  const y = bounds.height / 2 - (options.height ?? 0) / 2;

  let popupWindow: OpenFin.Window | undefined;

  const initialOptions = {
    modalParentIdentity: finWindow.identity,
    ...POPUP_WINDOW_DEFAULT_OPTIONS.initialOptions,
    ...options.initialOptions,
  };

  console.log(`url=${options.url}`);

  const popupResult = await finWindow.showPopupWindow({
    x,
    y,
    ...POPUP_WINDOW_DEFAULT_OPTIONS,
    ...options,
    initialOptions: initialOptions,
    onPopupReady: (popup) => (popupWindow = popup),
  });

  return { popupWindow, popupResult };
};

export const findDialog = async (name: string) => {
  const allWindows = await fin.Application.getCurrentSync().getChildWindows();
  return allWindows.find((w) => w.identity.name === name);
};

const findMonitorForBounds = async (bounds: OpenFin.WindowBounds) => {
  const monitorsInfo = await fin.System.getMonitorInfo();
  const currentWindowVerticalCentre = (bounds.bottom + bounds.top) / 2;
  const currentWindowHorizontalCentre = (bounds.right + bounds.left) / 2;
  const activeMonitor = [monitorsInfo.primaryMonitor, ...monitorsInfo.nonPrimaryMonitors].find(
    (monitor) =>
      inRange(currentWindowHorizontalCentre, monitor.availableRect.left, monitor.availableRect.right) &&
      inRange(currentWindowVerticalCentre, monitor.availableRect.bottom, monitor.availableRect.top),
  );
  return activeMonitor;
};

export const getWindowBounds = async (window: OpenFin.Window): Promise<OpenFin.WindowBounds> => {
  // when window is maximized, `window.getBounds` does not return correct values.
  // So we need to use the bounds of the monitor where Kea is displayed.
  const bounds = await window.getBounds();
  const isMaximized = (await window.getState()) === 'maximized';
  if (!isMaximized) {
    return bounds;
  }

  const activeMonitor = await findMonitorForBounds(bounds);
  if (!activeMonitor) {
    return bounds;
  }

  return {
    ...activeMonitor.availableRect,
    height: Math.abs(activeMonitor.availableRect.bottom - activeMonitor.availableRect.top),
    width: Math.abs(activeMonitor.availableRect.right - activeMonitor.availableRect.left),
  };
};

export interface IViewInfo {
  title: string;
  url: string;
  identity: OpenFin.Identity;
}

const updateAppsUrls = (layout: OpenFin.LayoutContent | undefined, appUrl: string) => {
  if (!layout) {
    return;
  }

  for (const view of layout) {
    // `view.type == "component"` is an actual app we need to update
    if (view.type !== 'component') {
      updateAppsUrls(view.content, appUrl);
      continue;
    }

    const component = view as OpenFin.LayoutComponent;
    if (!component.componentState?.url) {
      continue;
    }
    // only update views which are recognized apps
    const entryName = Object.values(EControlAppEntryName).find((entryName) =>
      component.componentState?.url?.endsWith(`/${entryName}`),
    );
    if (entryName) {
      component.componentState.url = `${appUrl}/${entryName}`;
    }
  }
};

/**
 Modifies @param snapshot by updating all its urls to use the provided @param openFinUrl and @param appUrl
 */
export const updateSnapshotUrls = (snapshot: OpenFin.Snapshot, openFinUrl: string, appUrl: string) => {
  for (const openfinWindow of snapshot.windows) {
    // only platform windows are saved into snapshots
    openfinWindow.url = `${openFinUrl}/platform.html`;
    // recursively update all views in the window
    updateAppsUrls(openfinWindow.layout?.content, appUrl);
  }
};

const getCurrentWindow = async (): Promise<OpenFin.Window | null> => {
  let finWindow = null;

  try {
    finWindow = await fin.Window.getCurrent();
  } catch (err: unknown) {}

  if (!finWindow) {
    try {
      const view = await fin.View.getCurrent();
      finWindow = await view.getCurrentWindow();
    } catch (err: unknown) {}
  }

  return finWindow;
};

export async function createControlAppView(
  id: EControlAppId,
  maybeCustomData?: unknown,
  parentWindow?: OpenFin.Window,
): Promise<OpenFin.View | undefined> {
  const finWindow = parentWindow || (await getCurrentWindow());
  const identity = finWindow?.identity;
  if (!identity) {
    console.error('failed to get OpenFinIdentity | cannot create view without it!');
    return;
  }

  const app = ControlApps[id];
  const uuid = getUuid();
  const name = `${app.name}-${uuid}`;
  const target = { uuid: identity.uuid, name };

  console.log(`name=${name}`);

  const processAffinity = app.processAffinity ? `${app.processAffinity}-${uuid}` : '';
  const options: OpenFin.PlatformViewCreationOptions = {
    name,
    target,
    processAffinity,
    url: app.url,
    detachOnClose: false,
    customData: maybeCustomData,
  };

  const platform = fin.Platform.getCurrentSync();
  return await platform.createView(options, identity);
}

async function focusExistingOrOpenNewView(
  appId: EControlAppId,
  entryName: string,
  parentWindow?: OpenFin.Window,
  customData?: unknown,
) {
  const platform = await fin.Platform.getCurrent();
  const windows = await platform.Application.getChildWindows();

  for (const window of windows) {
    const views = await window.getCurrentViews();
    for (const view of views) {
      const info = await view.getInfo();
      const isTargetView = info.url.endsWith(entryName);
      if (isTargetView) {
        await view.updateOptions({ customData });
        await window.bringToFront();
        await view.focus();
        return;
      }
    }
  }
  await createControlAppView(appId, customData, parentWindow);
}

export async function findView(viewIdentity: OpenFin.Identity) {
  const views = await fin.Application.getCurrentSync().getViews();
  return views.find((v) => isEqual(v.identity, viewIdentity));
}

export async function findWindow(windowName: string) {
  const platform = await fin.Platform.getCurrent();
  const windows = await platform.Application.getChildWindows();
  for (const window of windows) {
    if (window.identity.name === windowName) {
      return window;
    }
  }
}
