import { IpcBusPublisher, isMainWindow } from '@openfin-react/common/src';
import OpenFin, { fin } from '@openfin/core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const overrideCallback = async (PlatformProvider): PlatformProvider => {
  const ipcBusPublisher = await IpcBusPublisher.getInstanceAsync();

  class MyOverride extends PlatformProvider {
    /*
      We shouldn't need to override this function, but there appears to be a bug in OpenFin when both, `close-requested` and `beforeunload` events are used.
      Closing the main window should trigger the `close-requested` event which is handled in `platform.tsx` But something in `super.closeWindow()` gets confused and the app freezes.
      Because we know what to do when closing the main window, we can just skip calling `super.closeWindow()` and let the `close-requested` event be triggered.
    */
    async closeWindow(payload: OpenFin.CloseWindowPayload, callerIdentity: OpenFin.Identity): Promise<void> {
      if (isMainWindow(fin.Window.wrapSync(payload.windowId))) {
        return;
      }
      return super.closeWindow(payload, callerIdentity);
    }
  }
  // Return instance with methods to be consumed by Platform.
  // The returned object must implement all methods of the PlatformProvider class.
  // By extending the class, we can simply inherit methods we do not wish to alter.
  return new MyOverride();
};

console.log('fin.Platform.init() | start');
fin.Platform.init({ overrideCallback })
  .then(() => console.log('fin.Platform.init() | done'))
  .catch((error) => console.error('fin.Platform.init() | error', error));
