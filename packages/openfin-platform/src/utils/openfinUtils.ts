import OpenFin, { fin } from '@openfin/core';
import { first, inRange, isEqual } from 'lodash';
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
  const bounds = await finWindow.getBounds();
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

export const getCurrentWindow = async (): Promise<OpenFin.Window | null> => {
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
  entryName: string,
  maybeCustomData?: unknown,
  parentWindow?: OpenFin.Window,
): Promise<OpenFin.View | undefined> {
  const finWindow = parentWindow || (await getCurrentWindow());
  const identity = finWindow?.identity;
  if (!identity) {
    console.error('failed to get OpenFinIdentity | cannot create view without it!');
    return;
  }

  const uuid = getUuid();
  const name = `${entryName}-${uuid}`;
  const target = { uuid: identity.uuid, name };

  console.log(`name=${name}`);

  const options: OpenFin.PlatformViewCreationOptions = {
    name,
    target,
    url: `${window.location.origin}/${entryName}.html`,
    detachOnClose: false,
    customData: maybeCustomData,
  };

  const platform = fin.Platform.getCurrentSync();
  return await platform.createView(options, identity);
}

export async function focusExistingOrOpenNewView(
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
  await createControlAppView(entryName, customData, parentWindow);
}
